var axios = require('axios')
//var debug = require('debug')('controller/bwController')

var ColorImage = require("./ColorImageController")

const api_url = 'https://api.telegram.org/'

const WelcomeText = `Hi, I am Image Colorizer Bot.\nSend me a black and white image and I will color it for you.`
const ErrorText = `Error occurred processing this image. Please check your image and try again.`

module.exports = function(incomingMessage) {
    if(incomingMessage.message.text === '/start')
        return sendMessage(incomingMessage, WelcomeText)

    const photoArray = incomingMessage.message.photo
    const FileID = photoArray[photoArray.length - 1].file_id

    getImageStream(FileID)
    .then((res) => {
        console.log("Got Image Stream")

        return ColorImage(res)        
    }) 
    .then((res) => {
        console.log("Sending photo to telegram")

        sendPhoto(res.output_url, incomingMessage)
    }) 
    .catch((err) => {   
        console.log("Error in coloring image")
        
        sendMessage(incomingMessage, ErrorText)
    })

}

async function getImageStream(FileID) {
    try {
        let getFileRes = await axios.post(`${api_url}bot${process.env.BOT_TOKEN}/getFile`, {
            file_id: FileID
        })

        let ImageStream = await axios({
            method: 'get',
            url: `${api_url}file/bot${process.env.BOT_TOKEN}/${getFileRes.data.result.file_path}`,
            responseType:'stream'
        })
        debug(getFileRes.data.result)
        
        return ImageStream.data
    } 
    catch(err) {
        throw err
    }
}

function sendPhoto(ImageURL, incomingMessage) {
    axios.post(`${api_url}bot${process.env.BOT_TOKEN}/sendPhoto`, {
        chat_id: incomingMessage.message.chat.id,
        photo: ImageURL,
        caption: 'Colored Image',
        reply_to_message_id: incomingMessage.message.message_id
    })
    .catch((error) => {
        console.log("Error in sending colored image to telegram   ")

        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
        }
        
        console.log(error.message)
        console.log(error.config.data)
    })
} 

function sendMessage(incomingMessage, MessageText) {
    axios.post(`${api_url}bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: incomingMessage.message.chat.id,
        text: MessageText,
        reply_to_message_id: incomingMessage.message.message_id
    })
}