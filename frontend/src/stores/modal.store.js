import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const show        = ref(false)
  const showDelete  = ref(false)
  const editingNode = ref(null)   // null = create mode
  const deleteTarget= ref(null)
  const defaultParent = ref(null)

  function openCreate(parentId = null) {
    editingNode.value   = null
    defaultParent.value = parentId
    show.value = true
  }
  function openEdit(node) {
    editingNode.value   = { ...node }
    defaultParent.value = node.parent_id
    show.value = true
  }
  function openDelete(node) {
    deleteTarget.value = node
    showDelete.value   = true
  }
  function closeForm()   { show.value = false; editingNode.value = null }
  function closeDelete() { showDelete.value = false; deleteTarget.value = null }

  return { show, showDelete, editingNode, deleteTarget, defaultParent,
           openCreate, openEdit, openDelete, closeForm, closeDelete }
})
