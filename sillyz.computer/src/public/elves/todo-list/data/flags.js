const filters = {
  all: { key: 'ALL', label: 'All' },
  active: { key: 'ACTIVE', label: 'Active' },
  completed: { key: 'COMPLETED', label: 'Completed' },
}

export default {
  actions: {
    enter: 13,
  },
  filterOrdered: [
    filters.all.key,
    filters.active.key,
    filters.completed.key,
  ],
  filters: {
    [filters.all.key]: {
      label: filters.all.label,
    },
    [filters.active.key]: {
      label: filters.active.label,
    },
    [filters.completed.key]: {
      label: filters.completed.label,
    },
  }
}
