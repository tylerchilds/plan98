import('@plan98/types')







  .then(({ Self }) => {








    Self('elf-boot')








      .view((target) => `<multi-task








        src="/app/file-surf?${








          target.getAttribute('src')?`src=${target.getAttribute('src')}`:''








        }"








      ></multi-task>`)








  })








// quadouble spaced
