var request = require('request')
//var debug = require('debug')('controller/ColorImageController')

module.exports = function(ImageStream) {
    return new Promise((resolve , reject ) => {
        request.post({
            url: 'https://api.deepai.org/api/demographic-recognition',
            headers: {
                'Api-Key': process.env.API_KEY
            },
            formData: {
                'image': ImageStream
            }
        }, (err, httpResponse, body) => {
            if (err) {
                return reject(err)
            }

            let apiAns = JSON.parse(body)
            //console.log(apiAns[0].gender)
            //console.log(apiAns.output.faces[0].gender)
            //console.log(apiAns[0])
            //console.log(apiAns.gender)


            if(apiAns.err)
                return reject(apiAns)

            return resolve(apiAns)
        })
    })
}