class User {
  constructor({ user_id, name, username, password, role, created_date }) {
    this.user_id = user_id;
    this.name = name;
    this.username = username;
    this.password = password;
    this.role = role;
    this.created_date = created_date;
  }
}

module.exports = User;
