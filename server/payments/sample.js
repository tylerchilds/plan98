async function main() {
  const response = await fetch('https://checkout-test.adyen.com/v70/paymentLinks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-API-key': "API_KEY"
    },
    body: JSON.stringify({
      "reference": "HELLLO",
      "amount": {
        "value": 4200,
        "currency": "EUR"
      },
      "shopperReference": "YOUR_SHOPPER_REFERENCE",
      "description": "Blue Bag - ModelM671",
      "countryCode": "NL",
      "merchantAccount": "TheLandingPageECOM",
      "shopperLocale": "nl-NL"
    })
  }).then( response => response.text())

  console.log(response)

  const response2 = await fetch('https://checkout-test.adyen.com/v68/paymentLinks/PL293C3C74F0765353', {
    headers: {
      'Content-Type': 'application/json',
      'x-API-key': "API_KEY"
    }
  }).then(res => res.text())

  console.log(response2)
}

main()
