var fs = require('fs');
var xpath = require('xpath');
var parse5 = require('parse5');
var xmlser = require('xmlserializer');
var dom = require('xmldom').DOMParser;
var fileArr = []
var outputFile = fs.openSync('del.txt', 'w')
var fileArr = fs.readdirSync("D:/ag-serps")
var counter = 0

fileArr.forEach(x => {
    counter++
    console.log("Progress - filecount: " + counter, " of " + fileArr.length)
    var fileConstruct = "D:/ag-serps/" + x
    var f = fs.readFileSync(fileConstruct, 'utf-8')
    var regex = "(\\d{4}-\\d\\d-\\d\\d)-(.*?)-\\w+-\\w+--(\\w+\\.html)";
    var matcher = fileConstruct.match(regex);
    var date = matcher[1];
    var name = matcher[2];
    var platform = matcher[3];
    var document = parse5.parse(f.toString())
    var xhtml = xmlser.serializeToString(document);
    var doc = new dom().parseFromString(xhtml);
    var select = xpath.useNamespaces({
        "x": "http://www.w3.org/1999/xhtml"
    });

    var nodes = select("//x:div[@class='g']", doc)
    var finalObject = []

    for (var i = 0; i < nodes.length; i++) {

        var fullReview = '',
            title = '',
            link = '',
            hasReview = false,
            rootDomain = '',
            reviewCount,
            reviewScore,
            cleansedReview


        var element = nodes[i];
        var linkNodes = select(".//x:h3[@class='r']//x:a", element)

        for (var n = 0; n < linkNodes.length; n++) {
            var linkNode = linkNodes[n]
            title = linkNode.textContent
            link = linkNode.getAttributeNode('href').textContent
            var rootDomain = link.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0]
        }

        var reviews = select(".//x:div[@class='slp f']", element)

        for (var r = 0; r < reviews.length; r++) {

            if (reviews[r].textContent.match(/rating/gi)) {
                hasReview = true
                fullReview = reviews[r].textContent
                cleansedReview = fullReview.replace("Rating: ","").replace("reviews","").split("-")
                reviewScore = cleansedReview[0].trim()
                reviewCount = cleansedReview[1].trim()
            }


        }

        var finalObject = {
            date: date,
            searchQuery: name,
            platform: platform,
            serpResults: nodes.length,
            title: title,
            link: link,
            rootDomain: rootDomain,
            fullReview: fullReview,
            reviewCount : reviewCount,
            reviewScore : reviewScore,
            hasReview: hasReview,
        }


        fs.writeSync(outputFile, JSON.stringify(finalObject) + '\r\n')

    }

})

fs.close(outputFile)