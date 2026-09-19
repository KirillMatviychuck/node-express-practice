const { JSONFilePreset } = require('lowdb/node')
const path = require('path')

const defaultData = { movies: [], users: [], refreshTokens: [], moviePoster: '' }

let dbInstance = null;

const dbPath = path.join(__dirname, 'db.json')

async function getDB() {
    if (!dbInstance) {
        dbInstance = await JSONFilePreset(dbPath, defaultData)
    }
    return dbInstance

}

module.exports = {
    getDB
}