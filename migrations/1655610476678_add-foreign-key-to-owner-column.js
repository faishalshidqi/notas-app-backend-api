/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
	pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'foreign key(owner) references users(id) on delete cascade')
};

exports.down = pgm => {
	pgm.dropConstraint('notes', 'fk_notes.owner_users.id')
};
