const {Pool} = require('pg')
const {nanoid} = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')

class CollaborationsService {
	constructor() {
		this._pool = new Pool()
	}

	async verifyCollaborator(note_id, user_id) {
		const query = {
			text: 'select * from collaborations where note_id = $1 and user_id = $2',
			values: [note_id, user_id]
		}

		const result = await this._pool.query(query)

		if (!result.rows.length) {
			throw new InvariantError('Kolaborasi gagal diverifikasi')
		}

		return result.rows[0].id
	}

	async addCollaboration(note_id, user_id) {
		const id = `collab-${nanoid(16)}`
		const query = {
			text: 'insert into collaborations values($1, $2, $3) returning id',
			values: [id, note_id, user_id]
		}

		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new InvariantError('Kolaborasi gagal ditambahkan')
		}

		return result.rows[0].id
	}

	async deleteCollaboration(note_id, user_id) {
		const query = {
			text: 'delete from collaborations where note_id = $1 and user_id = $2 returning id',
			values: [note_id, user_id]
		}

		const result = await this._pool.query(query)

		if (!result.rows.length) {
			throw new InvariantError('Kolaborasi gagal dihapus')
		}
	}
}

module.exports = CollaborationsService
