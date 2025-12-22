import { Self } from '@plan98/types'

const $ = Self('silly-leaderboard')

$.draw(() => {
  return `
    <table>
      <tr>
        <th>
          Name
        </th>
        <th>
          #
        </th>
      </tr>
      <tr>
        <td>
          ---
        </td>
        <td>
          0
        </td>
      </tr>
      <tr>
        <td>
          ---
        </td>
        <td>
          0
        </td>
      </tr>
      <tr>
        <td>
          ---
        </td>
        <td>
          0
        </td>
      </tr>
    </table>
  `
})

$.eye(`
  & {
    display: block;
  }

  & table {
    width: 100%;
  }
`)
