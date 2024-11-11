export class UserDto {
    id
    name
    email
    role
  
    constructor(user) {
      this.id = user.id;
      this.name = user.name;
      this.email = user.email;
      this.role = user.role;
    }
  }