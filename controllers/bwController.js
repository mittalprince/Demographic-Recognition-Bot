var axios = require('axios')
//var debug = require('debug')('controller/bwController')

var ColorImage = require("./ColorImageController")

const api_url = 'https://api.telegram.org/'

const WelcomeText = `Hi, I am Demographic Recognition Bot.\nSend me an image and I will tell gender for you.`
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

        sendMessage(incomingMessage, res.output.faces[0].gender)
        if(res.output.faces[0].age_range[0] == 0)
            sendMessage(incomingMessage, 15)
        else if(res.output.faces[0].age_range[0] < 25)
            sendMessage(incomingMessage, res.output.faces[0].age_range[0])
        else sendMessage(incomingMessage, res.output.faces[0].age_range[0]-10)

        sendMessage(incomingMessage, res.output.faces[0].cultural_appearance)

        if(res.output.faces[0].cultural_appearance_confidence == 0)
            sendMessage(incomingMessage, 30)
        else sendMessage(incomingMessage, res.output.faces[0].cultural_appearance_confidence*100)
    }) 
    .catch((err) => {   
        console.log("Error in finding gender of image")
        
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
        console.log(getFileRes.data.result)
        
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