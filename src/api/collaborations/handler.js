const ClientError = require('../../exceptions/ClientError')
class CollaborationsHandler {
	constructor(collaborationsService, notesService, validator) {
		this._collaborationsService = collaborationsService
		this._notesService = notesService
		this._validator = validator

		this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
		this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
	}

	async postCollaborationHandler(request, h) {
		try {
			this._validator.validateCollaborationPayload(request.payload)
			const {id: credential_id} = request.auth.credentials
			const {note_id, user_id} = request.payload

			await this._notesService.verifyNoteOwner(note_id, credential_id)
			const collaborationId = await this._collaborationsService.addCollaboration(note_id, user_id)

			const response = h.response({
				status: 'success',
				message: 'Kolaborasi berhasil ditambahkan',
				data: {
					collaborationId
				}
			})
			response.code(201)
			return response
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message
				})
				response.code(error.statusCode)
				return response
			}
			// SERVER ERROR!!!
			const response = h.response({
				status: 'fail',
				message: 'Terjadi kegagalan pada server'
			})
			response.code(500)
			console.error(error)
			return response
		}
	}
	async deleteCollaborationHandler(request, h) {
		try {
			this._validator.validateCollaborationPayload(request.payload)
			const {id: credential_id} = request.auth.credentials
			const {note_id, user_id} = request.payload

			await this._notesService.verifyNoteOwner(note_id, credential_id)
			await this._collaborationsService.deleteCollaboration(note_id, user_id)

			return {
				status: 'success',
				message: 'Kolaborasi berhasil dihapus'
			}
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message
				})
				response.code(error.statusCode)
				return response
			}
			// SERVER ERROR!!!
			const response = h.response({
				status: 'fail',
				message: 'Terjadi kegagalan pada server'
			})
			response.code(500)
			console.error(error)
			return response
		}
	}
}

module.exports = CollaborationsHandler
