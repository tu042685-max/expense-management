import express from "express";
import { Request, Response } from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
dotenv.config()
const PORT = process.env.PORT;
app.use(cors({ origin: "*" }));
app.use(express.json());
// app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(process.cwd(), "../client/dist")));

//     app.get("/:path", (req, res) => {
//         res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
//     });
// }


app.get('/', (req: Request, res: Response) => {
    console.log("hello")
    res.json({ message: 'Hello World!' })
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});