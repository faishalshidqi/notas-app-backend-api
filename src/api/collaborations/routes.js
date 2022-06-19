const routes = (handler) => [
	{
		method: 'POST',
		path: '/collaborations',
		handler: handler.postCollaborationHandler,
		options: {
			auth: 'notas_jwt'
		}
	},
	{
		method: 'DELETE',
		path: '/collaborations',
		handler: handler.deleteCollaborationHandler,
		options: {
			auth: 'notas_jwt'
		}
	}
]

module.exports = routes
