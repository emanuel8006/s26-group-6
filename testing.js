const formData = new URLSearchParams({
  userId: 'c0652007-e490-469d-85b0-522ad734113c',
  formToken: '6988cc4082a634.69469595'
});

fetch('https://get.cbord.com/northeastern/full/funds_overview_partial.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: formData
})
.then(response => response.text()) // or .json() if it returns JSON
.then(data => console.log(data))
.catch(error => console.error('Error:', error));