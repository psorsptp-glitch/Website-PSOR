<template>
  <!-- SDMTreeRow.vue - Recursive tree row component -->

  <!-- Parent (Nomenklatur / Group header) row -->
  <tr
    :class="[
      'sdm-row',
      depth === 0 ? 'sdm-row--nomenklatur' : 'sdm-row--child',
      editingId === node.id ? 'sdm-row--editing' : ''
    ]"
  >
    <!-- Jabatan/Nama -->
    <td class="td-jabatan" :style="{ paddingLeft: (12 + depth * 24) + 'px' }">
      <!-- Expand/collapse toggle (only if has children) -->
      <button
        v-if="node.children?.length"
        class="toggle-btn"
        @click="$emit('toggle', node.id)"
      >
        {{ expandedIds.has(node.id) ? '▾' : '▸' }}
      </button>
      <span v-else class="toggle-spacer"></span>

      <!-- Edit mode: input -->
      <template v-if="editingId === node.id">
        <input v-model="editForm.nama_jabatan" class="cell-input cell-input--wide" />
      </template>
      <template v-else>
        <span :class="depth === 0 ? 'nama-nomenklatur' : 'nama-child'">{{ node.nama_jabatan }}</span>
      </template>
    </td>

    <!-- Jumlah Alat -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.jumlah_alat" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.jumlah_alat || '-' }}</template>
    </td>

    <!-- Ideal -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.ideal" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.level === 0 ? (node._totals?.ideal ?? '') : (node.ideal || '-') }}</template>
    </td>

    <!-- Min Req -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.min_req" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.level === 0 ? (node._totals?.min_req ?? '') : (node.min_req || '-') }}</template>
    </td>

    <!-- Shift -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.shift" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.shift || '-' }}</template>
    </td>

    <!-- Group -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.group_count" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.group_count || '-' }}</template>
    </td>

    <!-- Organik -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.organik" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.level === 0 ? (node._totals?.organik || '') : (node.organik || '-') }}</template>
    </td>

    <!-- TAD -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.tad" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.level === 0 ? (node._totals?.tad || '') : (node.tad || '-') }}</template>
    </td>

    <!-- Pemborongan -->
    <td class="col-num">
      <template v-if="editingId === node.id">
        <input v-model.number="editForm.pemborongan" type="number" class="cell-input cell-input--sm" min="0" />
      </template>
      <template v-else>{{ node.level === 0 ? (node._totals?.pemborongan || '') : (node.pemborongan || '-') }}</template>
    </td>

    <!-- Jumlah (auto-calculated) -->
    <td class="col-num col-total">
      <template v-if="editingId === node.id">
        {{ (editForm.organik || 0) + (editForm.tad || 0) + (editForm.pemborongan || 0) }}
      </template>
      <template v-else>
        {{ node.level === 0 ? (node._totals?.jumlah || '') : (node.jumlah || '-') }}
      </template>
    </td>

    <!-- Selisih Ideal -->
    <td class="col-num" :class="selisihClass(node.level === 0 ? node._totals?.selisih_ideal : node.selisih_ideal)">
      <template v-if="editingId !== node.id">
        {{ fmtSelisih(node.level === 0 ? node._totals?.selisih_ideal : node.selisih_ideal) }}
      </template>
    </td>

    <!-- Selisih Min -->
    <td class="col-num" :class="selisihClass(node.level === 0 ? node._totals?.selisih_min : node.selisih_min)">
      <template v-if="editingId !== node.id">
        {{ fmtSelisih(node.level === 0 ? node._totals?.selisih_min : node.selisih_min) }}
      </template>
    </td>

    <!-- Keterangan -->
    <td>
      <template v-if="editingId === node.id">
        <input v-model="editForm.keterangan" class="cell-input" />
      </template>
      <template v-else>{{ node.keterangan || '' }}</template>
    </td>

    <!-- Keterangan Lanjutan -->
    <td>
      <template v-if="editingId === node.id">
        <input v-model="editForm.keterangan_lanjutan" class="cell-input" />
      </template>
      <template v-else>{{ node.keterangan_lanjutan || '' }}</template>
    </td>

    <!-- Actions -->
    <td class="col-actions">
      <template v-if="editingId === node.id">
        <button class="btn-icon btn-save" title="Simpan" @click="$emit('save-edit', node)">✓</button>
        <button class="btn-icon btn-cancel" title="Batal" @click="$emit('cancel-edit')">✕</button>
      </template>
      <template v-else>
        <button class="btn-icon" title="Edit" @click="$emit('start-edit', node)">✏️</button>
        <button class="btn-icon btn-del" title="Hapus" @click="$emit('delete', node)">🗑️</button>
      </template>
    </td>
  </tr>

  <!-- Children (recursive) -->
  <template v-if="node.children?.length && expandedIds.has(node.id)">
    <SDMTreeRow
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :depth="depth + 1"
      :expanded-ids="expandedIds"
      :editing-id="editingId"
      :edit-form="editForm"
      @toggle="$emit('toggle', $event)"
      @start-edit="$emit('start-edit', $event)"
      @save-edit="$emit('save-edit', $event)"
      @cancel-edit="$emit('cancel-edit')"
      @add-child="$emit('add-child', $event)"
      @delete="$emit('delete', $event)"
    />
  </template>
</template>

<script setup>
// SDMTreeRow.vue - Recursive component

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  expandedIds: { type: Set, required: true },
  editingId: { type: String, default: null },
  editForm: { type: Object, default: () => ({}) },
});

defineEmits(['toggle', 'start-edit', 'save-edit', 'cancel-edit', 'add-child', 'delete']);

function selisihClass(val) {
  if (val === null || val === undefined) return '';
  return val >= 0 ? 'selisih-surplus' : 'selisih-deficit';
}

function fmtSelisih(val) {
  if (val === null || val === undefined) return '';
  return val >= 0 ? `+${val}` : String(val);
}
</script>

<style scoped>
/* Row styles */
.sdm-row td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: middle; }
.sdm-row:hover td { background: #f0f6ff; }

.sdm-row--nomenklatur td {
  background: #dbeafe;
  font-weight: 700;
  color: #1e3a5f;
  border-color: #bfdbfe;
}
.sdm-row--nomenklatur:hover td { background: #bfdbfe; }

.sdm-row--child td { background: #ffffff; }
.sdm-row--child:nth-child(even) td { background: #f8fafc; }

.sdm-row--editing td { background: #fefce8 !important; }

.td-jabatan {
  text-align: left;
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Since td is flex, we need to handle table layout differently */
.sdm-row td.td-jabatan {
  display: table-cell;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #3b82f6;
  padding: 0 4px;
  width: 20px;
  flex-shrink: 0;
}
.toggle-spacer { display: inline-block; width: 20px; }

.nama-nomenklatur { font-weight: 700; color: #1e40af; }
.nama-child { font-weight: 400; color: #374151; }

.col-num { text-align: center; }
.col-total { font-weight: 700; color: #1e3a5f; background: #f0f9ff; }
.col-actions { text-align: center; white-space: nowrap; min-width: 80px; }

.selisih-surplus { color: #16a34a; font-weight: 600; }
.selisih-deficit { color: #dc2626; font-weight: 600; }

/* Cell inputs */
.cell-input {
  width: 100%;
  padding: 3px 5px;
  border: 1px solid #3b82f6;
  border-radius: 3px;
  font-size: 11.5px;
  outline: none;
  box-sizing: border-box;
}
.cell-input--wide { min-width: 150px; }
.cell-input--sm { min-width: 50px; max-width: 70px; text-align: center; }

/* Icon buttons */
.btn-icon {
  background: none; border: none; cursor: pointer;
  font-size: 13px; padding: 2px 4px; border-radius: 3px;
  transition: background 0.15s;
}
.btn-save { color: #16a34a; }
.btn-save:hover { background: #dcfce7; }
.btn-cancel { color: #dc2626; }
.btn-cancel:hover { background: #fee2e2; }
.btn-del:hover { background: #fee2e2; }
.btn-icon:hover { background: #f1f5f9; }
</style>
