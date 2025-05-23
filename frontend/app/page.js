"use client";

import React from "react";
import { useState, useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import Form from "../components/form";
import Buttonwow from "../components/submit";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import CsvViewer from "../components/csvviewer.js";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/loader.js";
import dotenv from "dotenv";
dotenv.config();
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const Page = () => {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("Output");
  const [isfile, setIsfile] = useState(false);
  const [displayedCsvData, setDisplayedCsvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const gradientBorderClasses = `
    relative p-[1px] rounded-[10px] overflow-hidden
    bg-[#833AB4] bg-[linear-gradient(96deg,_rgba(131,_58,_180,_1)_0%,_rgba(253,_29,_29,_1)_50%,_rgba(252,_176,_69,_1)_100%)]
  `;
  const innerBgColor = "bg-[#040D12]";
  const handleUpload = async () => {
    toast.dismiss();
    if (!file) {
      toast.error("Please select a file to upload first!", {
        autoClose: false,
        closeButton: false,
      }); // Using toast.error
      return;
    }
    if (file.type != "text/csv") {
      toast.error("Please select a CSV file to upload first!", {
        autoClose: false,
        closeButton: false,
      }); // Using toast.error
      return;
    }
    if (query==="") {
      toast.warn(
        "Please enter a query. It helps the backend process your data better!"
      );
      return;
    }
    setOutput("");
    setIsLoading(true);
    // setDisplayedCsvData(file);
    console.log("hi");
    const uploadToastId = toast.info("Uploading file... Please wait.", {
      autoClose: false,
      closeButton: false,
      isLoading: true,
    }); // Persistent info toast for "uploading"

    const formData = new FormData();
    formData.append("csv_file", file);
    formData.append("query", query);
    setIsfile(true);
    try {
      const response = await axios.post(
          `${backendUrl}/uploadcsv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const result = response.data;
        toast.update(uploadToastId, {
          render: `Upload successful: ${result.message}`,
          // type: toast.TYPE.SUCCESS,
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.log("Upload successful:", result);
        setOutput(JSON.stringify(result.processed_data));
        setIsLoading(false);
      } else {
        const errorData = response.data;
        toast.update(uploadToastId, {
          render: `Upload failed: ${errorData.detail || response.statusText}`,
          type: toast.TYPE.ERROR,
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error("Upload failed:", response.status, errorData);
      }
    } catch (error) {
      toast.error("An unknown error occurred during upload.", {
        autoClose: true,
        closeButton: false,
      });
      let errorMessage = "An unknown error occurred during upload.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
      } else {
        errorMessage = error.message;
      }
      toast.update(uploadToastId, {
        render: `An error occurred during upload: ${error.message}`,

        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
      console.error("Network error during upload:", error);
    }
  };
  const handleFilepresence = () => {
    setDisplayedCsvData(null);
    setIsfile(false);
    setOutput("Output will be shown here");
    setIsLoading(false);
  };
  return (
    <div
      className="first flex items-center justify-center h-screen"
      style={{ background: "#040D12" }}
    >
      <ToastContainer
        position="top-right" // You can change position (top-left, bottom-center, etc.)
        autoClose={5000} // Default auto-close time in milliseconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Or "light", "colored"
      />
      <PanelGroup direction="horizontal" className="h-[95%] w-full">
        <Panel
          defaultSize={50}
          minSize={20}
          className="flex justify-center items-center"
        >
          <div className={`w-[calc(100%-20px)] h-[calc(100%-20px)] `}>
            <div
              className={`z-10 w-full h-full ${innerBgColor} rounded-[10px] flex flex-col items-center justify-center gap-[20px]`}
            >
              {!isfile && (
                <div className="flex flex-col items-center justify-center gap-[20px]">
                  <Form file={file} setFile={setFile} />
                  <Buttonwow handleUpload={handleUpload} />
                </div>
              )}
              {isfile && (
                <div className="w-[95%] h-[95%]  flex flex-col gap-[10px] items-center justify-start">
                  <div className="flex justify-end gap-[20px] w-full">
                    <button
                      className="w-10 h-10 cursor-pointer rounded-[3px] bg-[#833AB4] bg-[linear-gradient(96deg,_rgba(131,_58,_180,_1)_0%,_rgba(253,_29,_29,_1)_50%,_rgba(252,_176,_69,_1)_100%)]"
                      onClick={handleFilepresence}
                    >
                      X
                    </button>
                  </div>
                  <CsvViewer file={file} />
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-[10px] mr-[5px] bg-transparent transition-colors duration-200 cursor-ew-resize flex items-center justify-center">
          <div className="w-[2px] h-100 bg-gray-400 rounded-full"></div>
        </PanelResizeHandle>

        <Panel
          defaultSize={50}
          minSize={20}
          className="flex flex-col justify-center items-center"
        >
          <PanelGroup
            direction="vertical"
            className="h-full w-[calc(100%-20px)] flex flex-col gap-[5px]"
          >
            <Panel
              defaultSize={50}
              minSize={20}
              className="flex justify-center items-center"
            >
              <div className={`w-full h-[95%] `}>
                <textarea
                  placeholder="Enter your query e.g (what are the highest sales in the data)"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  className={`p-[12px] z-10 w-full h-full ${innerBgColor} rounded-[10px] flex items-center justify-center`}
                ></textarea>
                <button
                  className="absolute right-[10px] top-[10px] z-100 w-20 h-10 cursor-pointer rounded-[3px] bg-[#833AB4] bg-[linear-gradient(96deg,_rgba(131,_58,_180,_1)_0%,_rgba(253,_29,_29,_1)_50%,_rgba(252,_176,_69,_1)_100%)]"
                  onClick={handleUpload}
                >
                  Run
                </button>
              </div>
            </Panel>

            <PanelResizeHandle className="h-[1px] bg-transparent  transition-colors duration-200 cursor-ns-resize flex items-center justify-center">
              {/* Simple visual indicator for the resizer */}
              <div className="h-[2px] w-100 bg-gray-400 rounded-full"></div>
            </PanelResizeHandle>
            <Panel
              defaultSize={50}
              minSize={20}
              className="flex justify-center items-center"
            >
              <div
                className={`w-full h-[100%] flex justify-center items-center shadow-lg shadow-gray-500`}
              >
                <div className="h-full w-full flex justify-center items-center">
                  <div className="absolute">
                    {isLoading && <Loader />}
                  </div>
                  <textarea
                    value={output}
                    disabled={true}
                    className="p-[20px] z-10 w-[98%] h-[96%] ${innerBgColor}  text-[#EAEFEF] rounded-[6px] flex items-center justify-center "
                  ></textarea>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Page;
