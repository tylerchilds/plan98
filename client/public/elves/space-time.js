import elf from '@silly/elf'

const $ = elf('space-time')

$.draw(() => {
 const code = `
    export async function world(event, target) {
      const { toast } = await import('${self.location.origin}/public/elves/plan98-toast.js')
      if(toast) {
        toast('Hello World')
      }
    }
  `;

  const encodedJs = btoa(code);

  // Create the data URL
  const dataUrl = `data:text/javascript;base64,${encodedJs}`;


  return `
    <action-script data-script="${dataUrl}" data-action="world">Hello World</action-script>
  `
})
