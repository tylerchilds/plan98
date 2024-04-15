	curl https://checkout-test.adyen.com/v70/paymentLinks \
	-H "x-API-key: API_KEY" \
	-H "content-type: application/json" \
	-d '{
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
	}'

curl https://checkout-test.adyen.com/v68/paymentLinks/PL69EBD53874AB073E\
	-H "x-API-key: API_KEY" \
  
