const {Pool} = require('pg')
const {nanoid} = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class NotesService {
	constructor(collaborationsService) {
		this._pool = new Pool()
		this._collaborationsService = collaborationsService
	}

	async verifyNoteAccess(note_id, user_id) {
		try {
			await this.verifyNoteOwner(note_id, user_id)
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error
			}
			try {
				await this._collaborationsService.verifyCollaborator(note_id, user_id)
			} catch {
				throw error
			}
		}
	}

	async verifyNoteOwner(id, owner) {
		const query = {
			text: 'select * from notes where id = $1',
			values: [id]
		}

		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new NotFoundError('Catatan tidak ditemukan')
		}

		const note = result.rows[0]

		if (note.owner !== owner) {
			throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
		}
	}

	async addNote({title,body,tags,owner}) {
		const id = nanoid(16)
		const created_at = new Date().toISOString()
		const updated_at = created_at

		const query = {
			text: 'insert into notes values($1, $2, $3, $4, $5, $6,$7) returning id',
			values: [id,title,body,tags,created_at,updated_at,owner]
		}

		const result = await this._pool.query(query)
		if (!result.rows[0].id) {
			throw new InvariantError('Catatan gagal ditambahkan')
		}

		return result.rows[0].id
	}

	async getNotes(owner) {
		const query = {
			text: `select notes.* from notes 
						left join collaborations 
						on collaborations.note_id = notes.id 
						where notes.owner = $1 
						or collaborations.user_id = $1 
						group by notes.id`,
			values: [owner]
		}
		const result = await this._pool.query(query)
		// Tanpa rows nanti outputnya jadi ga jelas
		return result.rows
	}

	async getNoteById(id) {
		const query = {
			text: `select notes.*, users.username 
						from notes 
						left join users on users.id = notes.owner 
						where notes.id = $1`,
			values: [id]
		}
		const result = await this._pool.query(query)

		if (!result.rows.length) {
			throw new NotFoundError('Catatan tidak ditemukan')
		}

		// Tanpa rows nanti object data jadi kosong
		return result.rows[0]
	}

	async editNoteById(id, {title,body,tags}) {
		const updated_at = new Date().toISOString()
		const query = {
			text: 'update notes set title = $1, body = $2, tags = $3, updated_at = $4 where id = $5 returning id',
			values: [title,body,tags,updated_at,id]
		}
		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan')
		}
	}

	async deleteNoteById(id) {
		const query = {
			text: 'delete from notes where id = $1 returning id',
			values: [id]
		}

		const result = await this._pool.query(query)
		if (!result.rows.length) {
			throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan')
		}
	}

}

module.exports = NotesService
