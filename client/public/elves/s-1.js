import elf from '@plan98/elf'

const $ = elf('s-1')

$.draw(() => {
  return
}, {
  beforeUpdate(target) {
    if(!target.innerHTML) {
      target.innerHTML = `
        
      `
    }
  },
  afterUpdate() {
    
  }
})
