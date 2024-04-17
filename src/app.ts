import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import axios from "axios";
import cheerio from "cheerio";

import * as middlewares from "./middlewares";
import api from "./api";
import MessageResponse from "./interfaces/MessageResponse";

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Function to fetch dynamic variables from the home URL
async function fetchDynamicVariables() {
  try {
    const homeUrl = "https://www.carinfo.app/";
    const response = await axios.get(homeUrl);
    // Extract cookies, session IDs, or any other dynamic variables from response.headers or response.data
    // Return the extracted variables
    return {
      cookies: response.headers["set-cookie"],
      // Add other dynamic variables here if needed
    };
  } catch (error) {
    throw new Error("Failed to fetch dynamic variables");
  }
}

// Middleware to scrape owner name and registered RTO details
app.use("/rc-details/:vehicleNumber", async (req, res, next) => {
  try {
    const { vehicleNumber } = req.params;

    // Fetch dynamic variables from the home URL
    const dynamicVariables = await fetchDynamicVariables();

    const postUrl = `https://www.carinfo.app/rc-details/${vehicleNumber}`;

    // Make POST request to fetch HTML content using dynamic variables
    const response = await axios.post(postUrl, null, {
      headers: {
        // Pass dynamic variables in headers if required
        // For example, set cookies in the request header if it exists
        Cookie: dynamicVariables.cookies
          ? dynamicVariables.cookies.join("; ")
          : "",
        // Add other headers as needed
      },
    });

    const html = response.data;

    // Use Cheerio to parse HTML
    const $ = cheerio.load(html);

    // Find the element containing owner name
    const ownerNameElement = $('p:contains("Owner Name")');
    const ownerName =
      ownerNameElement.length > 0
        ? ownerNameElement.nextAll("p").eq(0).text().trim()
        : "Owner name not found";

    // Find the vehicle maker
    const vehicleMaker = $(
      "#__next > main > div > div.MuiBox-root.css-130f8nx > div > div.MuiBox-root.css-1co1rk5 > div.MuiBox-root.css-11gihrn > div > div.MuiBox-root.css-ig0coa > p.MuiTypography-root.MuiTypography-body1.css-1qt56zs"
    )
      .text()
      .trim();

    // Find the element containing registered RTO
    const registeredRTOElement = $('p:contains("Registered RTO")');
    const registeredRTO =
      registeredRTOElement.length > 0
        ? registeredRTOElement.next("p").text().trim()
        : "Not found";

    // Find the rtoPhoneNumber
    const rtoPhoneNumberElement = $(
      "#__next > main > div > div.MuiBox-root.css-130f8nx > div > div.MuiBox-root.css-1co1rk5 > div.MuiBox-root.css-a6rva7 > div.MuiBox-root.css-fb644l > div > div:nth-child(6) > p.MuiTypography-root.MuiTypography-body1.css-1c2ltzg"
    );
    const rtoPhoneNumber =
      rtoPhoneNumberElement.length > 0
        ? rtoPhoneNumberElement.text().trim()
        : "Not found";

    // Send JSON response with scraped data
    // Send JSON response with scraped data, including the maker element text
    res.json({
      vehicleNumber,
      ownerName,
      vehicleMaker,
      registeredRTO,
      rtoPhoneNumber,
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
