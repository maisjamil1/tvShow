'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 4000;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL)
client.on('error', (err) => console.log(err))

app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static('public'))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs')

//___________________________________________________

let handlers = require('./handlers')//ريفاكتورينج للايرور هاندلرز
//___________________________________________________
app.get('/', homeHandler)
app.post('/search', searchHandler)
app.get('/showResults', showResultsHandler)
app.post('/addtolist', addtolistHandler)
app.get('/myList', showList)
app.get('/showDetails/:id', showdetails)
app.put('/update/:id', updateHandler)
app.delete('/delete/:id', deleteHandler)
app.put('/addComment/:id', addCommentHandler)
app.use('*', handlers.notFoundHandler)//هون انا استدعيته من ملف الهانلرز




//___________________________________________________
//تجربة رندر ملف جيسون تعليقات الزوار
function homeHandler(req, res) {
    const dataFronJson=require('./testt.json')
   let finalJson=dataFronJson.map(val=>{
       return new JsonCON(val)
   })
    res.render('index.ejs',{data:finalJson})

};

function JsonCON(val){
    this.name=val.name
    this.date=new Date(val.date).toDateString()//عشان احول الصيغه من 9-5-2020 الى Sat Sep 05 2020
    this.comment=val.comment
}

//___________________________________________________

let myTVarr;//طلعتها برا عشان اقدر اوصلها من showResultsHandlerال
//عشان تبطل لوكال سكوب

function searchHandler(req, res) {
    let Textt = req.body.text
    let typee = req.body.type
    let URL = `https://api.themoviedb.org/3/search/${typee}?api_key=${process.env.MOVIE_API_KEY}&query=${Textt}`
    superagent.get(URL).then(data => {
        let myData = data.body.results
        // console.log(myData);
        myTVarr = myData.map(obj => {
            return new TVmaker(obj)
        })
        res.redirect('/showResults')

    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}

function TVmaker(data) {
    this.motv_id = data.id || 'not foundddddddd'
    this.title = data.name || data.title || 'not found'
    this.poster_path = `https://image.tmdb.org/t/p/w500/${data.poster_path}` || 'not foundddddddd'
    this.vote_count = data.vote_count || 'not foundddddddd'
    this.overview = data.overview || 'not foundddddddd'
    this.comment = ''//ماحطيت اشي عشان اضيفه بعدين من الفورم 
}

//___________________________________________________

function showResultsHandler(req, res) {
    res.render('pages/results.ejs', { data: myTVarr })
}

//___________________________________________________


function addtolistHandler(req, res) {
    let { motv_id, title, poster_path, vote_count, overview } = req.body

    //عملت هيك عشان اتاكد انو ما يتكرر عندي اشي بالداتا بيس لما اكبس اضف للقائمة
    const checkSQL = 'SELECT * FROM mtv WHERE motv_id=$1 AND title=$2 AND poster_path=$3 AND vote_count=$4 AND overview=$5;'
    let VALUES = [motv_id, title, poster_path, vote_count, overview]
    client.query(checkSQL, VALUES).then(results => {

        if (results.rows.length === 0) {//اذا الاريه فاضيه معناتو العنصر مش موجود فضيفلي اياه 
            const SQL = 'INSERT INTO mtv(motv_id, title, poster_path, vote_count, overview )VALUES($1,$2,$3,$4,$5);'
            client.query(SQL, VALUES).then(results => {
                res.redirect('/myList')
            })
                .catch(err => {
                    handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
                })

        } else {//اذا العنصر موجود اصلا رجعني لليست
            res.redirect('/myList')
        }
    })





}

//___________________________________________________
function showList(req, res) {
    const SQL = 'SELECT * FROM mtv;'
    client.query(SQL).then(results => {
        res.render('pages/myList.ejs', { data: results.rows })
    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}
//___________________________________________________

function showdetails(req, res) {
    let IID = req.params.id
    let SQL = 'SELECT * FROM mtv WHERE id=$1;'
    let VALUES = [IID]
    client.query(SQL, VALUES).then(results => {
        res.render('pages/details.ejs', { val: results.rows[0] })
    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}

//___________________________________________________

function deleteHandler(req, res) {
    let SQL = 'DELETE FROM mtv WHERE id=$1;'
    let VALUES = [req.params.id]
    client.query(SQL, VALUES).then(results => {
        res.redirect('/myList')
    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}

//___________________________________________________


function updateHandler(req, res) {
    let { motv_id, title, poster_path, vote_count, overview } = req.body

    const SQL = 'UPDATE mtv SET motv_id=$1, title=$2, poster_path=$3, vote_count=$4, overview=$5 WHERE id=$6;'
    let VALUES = [motv_id, title, poster_path, vote_count, overview, req.params.id]
    client.query(SQL, VALUES).then(results => {
        res.redirect('/myList')
    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}



//___________________________________________________

function addCommentHandler(req, res) {
    let SQL = 'UPDATE mtv SET comment=$1 WHERE id=$2;'//هو تلقائيا مافي بالداتا بيس كومنت فانا بضيفه
    let VALUES = [req.body.comment, req.params.id]
    client.query(SQL, VALUES).then(results => {
        res.redirect('/myList')
    })
        .catch(err => {
            handlers.errorHandler(err, req, req)//جاي من ملف الهاندلرز
        })
}

//___________________________________________________











//___________________________________________________
app.get('/test', test)

function test(req, res) {
    res.send('yesssssssssssssssss')
}



client.connect().then(() => {
    app.listen(PORT, () => console.log('up on', PORT))
})
    .catch((err) => console.log(err))
