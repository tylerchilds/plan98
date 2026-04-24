import { Self } from '@plan98/types'

function validate(data) {
  const errors = []

  const { pairs, password } = data

  if(!password && pairs.length === 0) {
    errors.push('Either a password or recovery code(s) are required.')
  }

  if(pairs.length > 0 && !validPairs(data)) {
    errors.push('Recovery code fields are invalid.')
  }

  return errors
}

function validPairs(data) {
  return data.pairs.every(([questionKey, answerKey]) => {
    return data[questionKey] && data[answerKey]
  })
}

const $ = Self('n-k', {
  errors: [],
  n: 1,
  password: '',
  pairs: []
})

$.e('input', '.name-pair', (event) => {
  const field = event.target
  $.c({ [field.name]: field.value })
})

$.e('click', '.create-recovery', createRecovery)
$.e('click', '.add-recovery-code', addRecoveryCode)
$.e('click', '.del-recovery-code', delRecoveryCode)

$.e('submit', '[action="9p"]', (event) => {
  event.preventDefault()
  const data = $.m()

  $.c({ errors: [] })

  const errors = validate(data)

  console.log(JSON.stringify(data, '', 2))
  console.log(errors)

  if(errors.length > 0) {
    $.c({ errors })
  } else {
    $.c({ success: true })
  }
})

function createRecovery(event) {
  $.c({
    pairs: [
      ['question1', 'answer1']
    ],
    question1: 'Recovery Hint: 1',
    answer1: ''
  })
}

function addRecoveryCode(event) {
  const id = parseInt(event.target.dataset.index)
  const questionKey = `question${id}`
  const answerKey = `answer${id}`

  $.c(
    {
      id,
      questionKey,
      answerKey
    },
    (s, p) => ({
      ...s,
      pairs: [...s.pairs, [p.questionKey, p.answerKey]],
      [p.questionKey]: 'Recovery Hint: ' + p.id,
      [p.answerKey]: '',
    })
  )
}

function delRecoveryCode(event) {
  $.c(
    {
      id: parseInt(event.target.dataset.del)
    },
    (s, p) => {
      const pairs = [...s.pairs].filter((x, id) => id !== p.id)
      return {
        ...s,
        pairs,
        n: s.n > pairs.length ? pairs.length : s.n
      }
    }
  )
}

function calculateSecurityAndLegality(password, pairs) {
  if(!password && pairs.length === 0) {
    return "I understand that I have no meaningful way to actually log in with what I've completed on this form thus far."
  } else if(password && pairs.length === 0) {
    return "I must use password to connect as I have no recovery codes."
  } else if(!password && pairs.length > 0) {
    return "I must use recovery codes to connect as I have no password."
  } else if(password && pairs.length > 0) {
    return "I should use password to connect and may connect with recovery codes."
  }
}

$.v((target) => {
  const { password, pairs, errors, success, n } = $.m()

  if(success) {
    return `
      <div style="border-left: 2px solid mediumseagreen; padding: .5rem; border-radius: 4px; box-shadow: 0 4px 4px 4px rgba(0,0,0,.1); margin: 1rem;">
        Yay!
      </div>
    `
  }

  const legalText = calculateSecurityAndLegality(password, pairs)

  const recoveryFields = pairs.map(([questionKey, answerKey], index) => {
    const question = $.m()[questionKey] || ''
    const answer = $.m()[answerKey] || ''
    const nonZeroOffset = index + 1
    return `
      Recovery Code: #${nonZeroOffset} 
      <div class="recovery-code">
        <label class="field">
          <span class="label -as-input">
            <input class="name-pair" name="question${nonZeroOffset}" value="${question}"/>
          </span>
          <input type="password" class="name-pair" name="answer${nonZeroOffset}" value="${answer}"/>
        </label>

        <div>
          <button type="button" class="del-recovery-code standard-button bias-generic" data-del="${index}">
            DEL
          </button>
        </div>
      </div>
    `
  }).join('')

  return `
    <form method="POST" action="9p" class="wizard">
      <h1>Secure Setup</h1>
      <p>
        Set a password to easily access your account. Or leave blank.
        If blank, recovery codes must be set. If set, password: optional.
      </p>
      <label class="field">
        <span class="label -as-input">
          Password
        </span>
        <input type="password" class="name-pair" name="password" value="${password}"/>
      </label>

      ${recoveryFields ? `
        ${recoveryFields}
        <div style="text-align: right; margin-bottom: 1rem;">
          <button type="button" data-index="${pairs.length + 1}" class="add-recovery-code standard-button bias-generic">
            Add Recovery Code
          </button>
        </div>

        ${pairs.length >= 2 ? `
          <p>
            How many recovery codes must be correct for account takeover?
            <br>
            <strong>${n}</strong>
          </p>

          <input type="range" name="n" min="1" max="${pairs.length}" value="${n}" class="name-pair"/>
        `:''}
      ` : `
        <div style="text-align: right; margin-bottom: 1rem;">
          <button class="create-recovery standard-button bias-generic">
            Add Recovery Code
          </button>
        </div>
      `}

      <label class="field">
       <input name="ignore" type="checkbox" />
       <span class="label">${legalText}</span>
      </label>
      ${errors.length > 0 ? `
        <div style="border-left: 2px solid firebrick; padding: .5rem; border-radius: 4px; box-shadow: 0 4px 4px 4px rgba(0,0,0,.1); margin: 1rem;">
          ${errors.map(x => x).join(', ')}
        </div>
      `: ''}
      <button class="standard-button bias-positive" style="text-align: center; display: block; width: 100%;" type="submit">
        Activate
      </button>
    </form>
  `
})

$.s(`
  & { display: block; }

  & .recovery-code {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & input[type="range"] {
    width: 100%;
  }
`)
