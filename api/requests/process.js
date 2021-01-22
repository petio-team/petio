const Request = require("../models/request");
const User = require("../models/user");

class processRequest {
  constructor(req = {}, usr = {}) {
    this.request = req;
    this.user = usr;
  }
  async new() {
    let out = {};
    try {
      let existing = await Request.findOne({ requestId: this.request.id });
      let msg = false;

      if (existing) {
        msg = await this.existing();
      } else {
        msg = await this.create();
      }
      out = {
        message: msg,
        user: this.user.title,
        request: this.request,
      };
    } catch (err) {
      console.log("REQ: Error");
      console.log(err);
      out = {
        message: "failed",
        error: true,
        user: this.user,
        request: this.request,
      };
    }
    return out;
  }

  async existing() {
    await Request.updateOne({ requestId: this.request.id }, { $push: { users: this.user.id } });
    return "request updated";
  }

  async create() {
    const newRequest = new Request({
      requestId: this.request.id,
      type: this.request.type,
      title: this.request.title,
      thumb: this.request.thumb,
      users: [this.user.id],
      imdb_id: this.request.imdb_id,
      tmdb_id: this.request.tmdb_id,
      tvdb_id: this.request.tvdb_id,
    });

    try {
      await newRequest.save();
      return "request added";
    } catch (err) {
      console.log(err);
      return "request failed";
    }
  }

  async mailRequest(user, request) {
    let userData = await User.findOne({ id: user });
    if (!userData) {
      userData = {
        email: prefs.adminEmail,
      };
    }
    const requestData = await Request.findOne({ requestId: request });
    console.log(requestData);
    let type = requestData.type === "tv" ? "TV Show" : "Movie";
    new Mailer().mail(
      `You've just requested the ${type} ${requestData.title}`,
      `${type}: ${requestData.title}`,
      `Your request has been received and you'll receive an email once it has been added to Plex!`,
      `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
      [userData.email]
    );
  }
}

module.exports = processRequest;
