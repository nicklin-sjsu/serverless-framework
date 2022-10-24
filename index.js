var fs = require('fs'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3();
const Jimp = require('jimp');

var colors = [
    "red",
    "blue",
    "yellow",
    "green"
]
const maxFontSize = 28
const minFontSize = 14

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log("event params", event.queryStringParameters);
    try {
        var dogerand = Math.floor(Math.random() * 4 + 1)
        var dogefile = `doge` + dogerand + `.jpg`
        var fileNum = Math.floor(Math.random() * 1000),
            fileName = `/tmp/doge-${fileNum}.jpg`,
            s3filename = `doge-${fileNum}.jpg`;//`doge-${event.queryStringParameters.text}-${fileNum}.jpg`

        // Reading image
        const image = Jimp.read(dogefile)
            .then(image => {
                // Resize image
                const font = Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
                    .then(font => {
                        image.print(font, 10, 350, event.queryStringParameters.text);
                        image.writeAsync(fileName)
                            .then(() => {

                                var imgdata = fs.readFileSync(fileName)

                                var s3params = {
                                    Bucket: 'bryanc21',
                                    Key: s3filename,
                                    Body: imgdata,
                                    ContentType: 'image/jpeg',
                                    ACL: "public-read"
                                }
                                console.log("s3params", s3params)
                                s3.putObject(s3params,
                                    (err, obj) => {
                                        if (err) {
                                            console.log("Error: ", err)
                                            const response = {
                                                statusCode: 200,
                                                body: "Sad",
                                            };
                                            callback(null, response);
                                        }
                                        console.log("sent")
                                        const response = {
                                            statusCode: 200,
                                            body: `https://bryanc21.s3.amazonaws.com/${s3filename}`,
                                        };
                                        callback(null, response);
                                    }
                                )

                            })
                    })
            })
    }

    catch (err) {
        console.log("Error: ", err)
        const response = {
            statusCode: 200,
            body: "error"
        };
        callback(null, response);
    }
}