import express from 'express'
import session from 'express-session'

const app = express()
app.set('view engine', 'pug')
app.use(express.static('assets'))
app.use(express.json())

