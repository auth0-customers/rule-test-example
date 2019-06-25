function rule(user, context, callback) {
  if (global.error) return callback({ message: 'some error' });

  user.newField = 'blah';
  return callback(null, user, context);
}
