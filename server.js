// Dependencies
const http = require("http");
const fs = require("fs");
const port = process.env.PORT || 3000
const server = http.createServer(handleRequest);

let db = [];

// Request Handle
function handleRequest(req, res) {
    const path = req.url;
    switch (path) {
        case "/reviews":
            return renderReviewsPage(req, res);
        default:
            return renderWelcomePage(req, res);
    }
}

// Render Welcome page index.html
function renderWelcomePage(req, res) {
    fs.readFile("./index.html", function (err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        }
        else {
            // We then respond to the client with the HTML page by specifically telling the browser that we are delivering
            // an html file.
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        }
    });
}

// Rander second page with all the data
function renderReviewsPage(req, res) {
    // Saving the request posted data as a variable.
    let requestData = "";
    let firstname;
    let lastname;
    let book;
    let author;
    let review;
    let comment;
    
    // When the server receives data, it will add it to requestData.
    req.on("data", function (data) {
        requestData += data;

        // Parse the user inputs
        firstname = data.toString().split('&')[0].split('=')[1].replace(/[+]/g, ' ');
        lastname = data.toString().split('&')[1].split('=')[1].replace(/[+]/g, ' ');
        book = data.toString().split('&')[2].split('=')[1].replace(/[+]/g, ' ');
        author = data.toString().split('&')[3].split('=')[1].replace(/[+]/g, ' ');
        review = data.toString().split('&')[4].split('=')[1].replace(/[+]/g, ' ');
        comment = data.toString().split('&')[5].split('=')[1].replace(/[+]/g, ' ');
        let date_ob = new Date();

        // create a different user object for each input
        let userInput = {
            firstname: firstname,
            lastname: lastname,
            book: book,
            author: author,
            review: review,
            comment: comment,
            date_ob: date_ob
        }
        // Store into a array (database)
        db.push(userInput);
        console.log(userInput);
    });      

    // Request has ended
    req.on("end", function () {    
        let myHTML = generateReviews();
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(myHTML);
    });
}


// Generate the reviews
function generateReviews() {
    let output = ""
    // Generate the data to be render onto the client side
    for(let i = db.length-1; i >= 0; i--) {
        let date = ("0" + db[i].date_ob.getDate()).slice(-2);
        let month = ("0" + (db[i].date_ob.getMonth() + 1)).slice(-2);
        let year = db[i].date_ob.getFullYear();
        let hours = db[i].date_ob.getHours();
        let minutes = db[i].date_ob.getMinutes();
        let seconds = db[i].date_ob.getSeconds();
        output += '<div class="card">'+
            '<div class="card-header" id="heading'+i+'">'+
            '<h2 class="mb-0">'+
                '<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'">'+
                '<div class="float-left">' + db[i].book + ' by ' + db[i].author + '</div><div class="float-right"> Posted on ' + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + '</div>' +
                '</button>'+
            '</h2>'+
            '</div>'+
            '<div id="collapse'+i+'" class="collapse" aria-labelledby="heading'+i+'" data-parent="#accordionExample">'+
            '<div class="card-body">'+
            'Firstname: ' + db[i].firstname + " </p><p> Lastname: " + db[i].lastname + " </p><p> Book review: " + db[i].review + " </p><p> Comment: " + db[i].comment + " </p> " + 
            '</div>'+
            '</div>'+
        '</div>';
    }

    // Content to be render back to client
    myHTML =
        '<!doctype html><html lang="en">'+
            '<head><meta charset="utf-8">'+
            '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'+
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">'+
            '<style>'+
                'body{ background-color: rgb(52, 116, 189); color: #ffffff; }'+
                'a{ color: #ffffff; text-decoration: none;}'+
                'a:hover{ color: #9e9a9a}'+
                '.card,.card-header,.card-body{background-color: rgba(0, 0, 0, 0.2)}'+
                '.card button{color: #ffffff; text-decoration: none;}'+
                '.card button:hover{color: #9e9a9a; text-decoration: none;}'+
            '</style>'+
            '<title>Hello, world!</title>'+
        '</head>'+
        '<body class="container pt-5 pb-5">' +
            '<h1>Thank you for your review! </h1> <h3>Last reviews: </h3>'+
            '<div class="accordion pt-5 pb-5" id="accordionExample" style="min-height: 70vh">' +
            output +
            '</div>'+
            '<a href="/"><button type="button" class="btn btn-dark">Home page</button></a>'+
            '<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>'+
            '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>'+
            '<footer class="page-footer font-small blue pt-4">'+
            '<div class="footer-copyright text-center py-3">Copyright © <a href="https://enricogaraiman.com/"> enricogaraiman.com</a> 2021 - All right reserved'+
            '</div>'+
            '</footer>'+
        '</body></html>';
    return myHTML;
}

// Starts the server
server.listen(port, function () {
    console.log("Server listening on: http://localhost:" + PORT);
});
