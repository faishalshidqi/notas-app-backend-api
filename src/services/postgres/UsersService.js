const {Pool} = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const {nanoid} = require('nanoid')
const bcrypt = require('bcrypt')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthenticationError = require('../../exceptions/AuthenticationError')
class UsersService {
	constructor() {
		this._pool = new Pool()
	}

	async verifyUserCredential(username, password) {
		const query = {
			text: 'select id, password from users where username = $1',
			values: [username]
		}

		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new AuthenticationError('Kredensial yang Anda berikan salah')
		}

		const {id, password: hashedPassword} = result.rows[0]
		const match = await bcrypt.compare(password, hashedPassword)
		if (!match) {
			throw new AuthenticationError('Kredensial yang Anda berikan salah')
		}

		return id
	}

	async verifyNewUsername(username) {
		const query = {
			text: 'select username from users where username = $1',
			values: [username]
		}

		const result = await this._pool.query(query)
		if (result.rows.length > 0) {
			throw new InvariantError('Gagal menambahkan user. Username sudah digunakan')
		}
	}

	async addUser({username,password,fullname}) {
		await this.verifyNewUsername(username)
		const id = `user-${nanoid(16)}`
		const hashedPassword = await bcrypt.hash(password, 10)

		const query = {
			text: 'insert into users values($1,$2,$3,$4) returning id',
			values: [id,username,hashedPassword,fullname]
		}
		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new InvariantError('User gagal ditambahkan. ')
		}

		return result.rows[0].id
	}

	async getUserById(id) {
		const query = {
			text: 'select id, username, fullname from users where id = $1',
			values: [id]
		}

		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new NotFoundError('User tidak ditemukan')
		}

		return result.rows[0]
	}

	async getUsersByUsername(username) {
		const query = {
			text: 'select id, username, fullname from users where username like $1',
			values: [`%${username}%`]
		}

		const result = await this._pool.query(query)
		return result.rows
	}
}

module.exports = UsersService
