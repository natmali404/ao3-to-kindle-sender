import express from "express";
import cors from "cors";

const corsOptions = {
    origin: ["http://localhost:5173"]
}


const app = express();

app.use(cors(corsOptions))

app.get("/", (request, response) => {
    response.json({statusMessage: "App is running!"})
})


app.post("/execute", (request, response) => {
    console.log("Function executed on the server!");
    response.json({ message: "Function executed successfully!" });
  });



app.listen(8080, () => {
    console.log("Server started on port 8080")
})


