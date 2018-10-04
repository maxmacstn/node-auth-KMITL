const axios = require('axios')
const qs = require('querystring');
const userData = require('./config.json')
console.log("Try Logging in...")
axios.post('https://mylogin.kmitl.ac.th:8445/PortalServer/Webauth/webAuthAction!login.action', qs.stringify({
  userName: userData.userName, password: userData.password
}), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  }).then(function (res) {
    token = res.data.token
    clientIp = res.data.data.ip
    if (token) {
      console.log("Logged in")
      console.log("Try syncing")
      let config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': res.headers['set-cookie'][0]
        },
      }
      axios.post('https://mylogin.kmitl.ac.th:8445/PortalServer/Webauth/webAuthAction!syncPortalAuthResult.action', qs.stringify({
        browserFlag: "en",
        clientIp: clientIp
      }), config).then(function (res) {
        let webHeatbeatPeriod = res.data.data.webHeatbeatPeriod / 4
        console.log("Setting heartbeat with interval : " + webHeatbeatPeriod + "ms")
        setInterval(function () {
          console.log("Sending heartbeath")
          axios.post('https://mylogin.kmitl.ac.th:8445/PortalServer/Webauth/webAuthAction!hearbeat.action', qs.stringify({
            userName: userData.userName,
            clientIp: clientIp
          }), config).then(function (res) {
            if (res.data.data == 'ONLINE') {
              console.log("Success")
            } else {
              console.log("Failed")
            }
          })
        }, webHeatbeatPeriod)
      })
    } else {
      console.log("Login failed. response data :", res.data)
    }


  })