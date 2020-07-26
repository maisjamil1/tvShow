'use strict';
require('dotenv').config();
const express=require('express');
const pg=require('pg');
const superagent=require('superagent');
const methodOverride=require('method-override');

const PORT=process.env.PORT||4000;
const app=express();
const client=new pg.Client(process.env.DATABASE_URL)
// client.on('error',(err)=>console.log(err))

app.use(express.urlencoded({extended:true}))
app.use('/public',express.static('public'))

// app.use(express.static('./public')); 
app.use(methodOverride('_method'))

app.set('view engine','ejs')








app.get('/test',test)

function test(req,res){
    res.send('yesssssssssssssssss')
}





client.connect().then(()=>{
    app.listen(PORT,()=>console.log('up on',PORT))
})
// .catch((err)=>console.log(err))
