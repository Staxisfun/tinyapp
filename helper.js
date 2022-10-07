const getUserByEmail = (email, database) => {
  for (const id in database) {
    const user = database[id];

    if (user.email === email) {
      // we found our user!!
      return user;
    }
  }

  return undefined;
};


module.exports = { getUserByEmail };