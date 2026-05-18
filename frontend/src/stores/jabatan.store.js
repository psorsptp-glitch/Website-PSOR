import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { flatToMap } from '@/utils/tree'

export const useJabatanStore = defineStore('jabatan', () => {

  // ── 🧱 STATE ─────────────────────────────────────────────
  const nodes        = ref([])        // data utama
  const nodesMap     = ref({})        // id → node tree
  const selectedNode = ref(null)
  const collapsedIds = ref(new Set())
  const loading      = ref(false)
  const error        = ref(null)

  const searchQuery  = ref('')
  const filterDiv    = ref('')
  const filterStatus = ref('')

  const divisions    = ref([])

  // ── 🛡️ SAFE LAYER (ANTI UNDEFINED) ───────────────────────
  const allNodes = computed(() => nodes.value || [])
  const allDivisions = computed(() => divisions.value || [])

  const totalLevels = computed(() => {
    if (!allNodes.value.length) return 0
    return Math.max(...allNodes.value.map(n => n.level || 0))
  })

  // ── 🌳 TREE ROOT ─────────────────────────────────────────
  const rootIds = computed(() =>
    allNodes.value.filter(n => !n.parent_id).map(n => n.id)
  )

  // ── 🔍 FILTER ────────────────────────────────────────────
  const filteredNodes = computed(() => {
    const q = searchQuery.value.toLowerCase()

    return allNodes.value.filter(n => {
      const matchQ =
        !q ||
        n.title?.toLowerCase().includes(q) ||
        (n.person_name || '').toLowerCase().includes(q)

      const matchDiv =
        !filterDiv.value || n.division === filterDiv.value

      const matchStatus =
        !filterStatus.value || n.status === filterStatus.value

      return matchQ && matchDiv && matchStatus
    })
  })

  // ── 📊 STATS ─────────────────────────────────────────────
  const stats = computed(() => ({
    total: allNodes.value.length,
    active: allNodes.value.filter(n => n.status === 'active').length,
    inactive: allNodes.value.filter(n => n.status !== 'active').length,
    divCount: allDivisions.value.length
  }))

  // ── 🌐 FETCH DATA ────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/jabatan?limit=500')

      // 🧠 Flexible handling (API kadang beda format)
      const data = res.data?.data || res.data || []

      nodes.value = data
      nodesMap.value = flatToMap(data)

    } catch (err) {
      error.value = err.message || 'Gagal memuat data'
    } finally {
      loading.value = false
    }
  }

  async function fetchDivisions() {
    try {
      const res = await api.get('/jabatan/divisions')
      divisions.value = res.data?.data || res.data || []
    } catch (_) {}
  }

  // ── ✏️ CRUD ──────────────────────────────────────────────
  async function create(payload) {
    const res = await api.post('/jabatan', payload)
    await fetchAll()
    return res.data
  }

  async function update(id, payload) {
    const res = await api.put(`/jabatan/${id}`, payload)
    await fetchAll()

    if (selectedNode.value?.id === id) {
      selectedNode.value = res.data
    }

    return res.data
  }

  async function remove(id) {
    await api.delete(`/jabatan/${id}`)

    if (selectedNode.value?.id === id) {
      selectedNode.value = null
    }

    await fetchAll()
  }

  async function move(id, newParentId) {
    await api.patch(`/jabatan/${id}/move`, {
      parent_id: newParentId
    })

    await fetchAll()
  }

  // ── 🎯 UI STATE ─────────────────────────────────────────
  function selectNode(node) {
    selectedNode.value = node
  }

  function clearSelection() {
    selectedNode.value = null
  }

  function toggleCollapse(id) {
    const set = new Set(collapsedIds.value)

    if (set.has(id)) set.delete(id)
    else set.add(id)

    collapsedIds.value = set
  }

  function expandAll() {
    collapsedIds.value = new Set()
  }

  function collapseAll() {
    const ids = allNodes.value
      .filter(n => (nodesMap.value[n.id]?.children || []).length > 0)
      .map(n => n.id)

    collapsedIds.value = new Set(ids)
  }

  // ── 🚀 EXPORT ───────────────────────────────────────────
  return {
    // state
    nodes,
    nodesMap,
    selectedNode,
    collapsedIds,
    loading,
    error,
    searchQuery,
    filterDiv,
    filterStatus,
    divisions,

    // safe alias (IMPORTANT)
    allNodes,
    allDivisions,
    totalLevels,

    // computed
    rootIds,
    filteredNodes,
    stats,

    // actions
    fetchAll,
    fetchDivisions,
    create,
    update,
    remove,
    move,
    selectNode,
    clearSelection,
    toggleCollapse,
    expandAll,
    collapseAll
  }
})