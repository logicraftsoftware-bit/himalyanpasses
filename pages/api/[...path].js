import app from "../../backend/backend/app.js";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true
  }
};

export default function apiHandler(req, res) {
  app(req, res);
}
