import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MarkdownPreview from "@uiw/react-markdown-preview";
import Loading from "./Loading";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

function App() {
  const [fileData, setFileData] = useState(null);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [isData, setIsData] = useState(false);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const config = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const uploadFile = (e) => {
    setLoading(false);
    const file = e.target.files[0];
    if (!file) return alert("No File Selected");
    const fd = new FormData();
    fd.append("myfile", file);
    fetch("https://mern-workshop.onrender.com/uploadfile", {
      method: "POST",
      body: fd,
    }).then((res) => {
      if (res.status === 200) {
        alert("file uploaded");
        res.json().then((data) => {
          const { file, url } = data;
          console.log(url);
          setFileData(file);

          run(file);
        });
      }
    });
  };

  const run = async ({ uri, mimeType }) => {
    const chatSession = model.startChat({
      generationConfig: config,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType,
                fileUri: uri,
              },
            },
            {
              text: "Accurately identify the food in the image and provide an appropriate recipe consistent with your analysis",
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    console.log(result.response.text());
    setIsData(true);
    setLoading(true);
    setData(result.response.text());
  };

  return (
    <main className="bg-cyan-200 py-5">
      <div className="max-w-[80%] mx-auto">
        <h1 className=" text-5xl text-center font-bold"> What's My Recipe</h1>
        <label htmlFor="">Upload File!</label>
        <br />
        <input type="file" onChange={uploadFile} />
      </div>
      <div className="max-w-[80%] mx-auto mt-10">
        {loading ? (
          <MarkdownPreview
            source={data}
            style={{ padding: 16, borderRadius: 10 }}
          />
        ) : (
          <Loading />
        )}
      </div>
    </main>
  );
}

export default App;
