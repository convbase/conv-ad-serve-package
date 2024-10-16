import { setCachedWebsite } from "../cache";
import { adServerUrl } from "../config";
import { WebsiteStatistics } from "../models/website-statistics";

export async function getWebsiteByURL(url: string): Promise<any> {
  const response = await fetch(
    `${adServerUrl}/get-website-by-url?url=${encodeURIComponent(
      url
    )}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (response.ok) {
    const result = await response.json();
    console.log(result);
    setCachedWebsite(result);
    return result.data;
  } else {
    console.error("Failed to fetch website by URL");
    return null;
    
  }
}

// export async function getWebsiteStatisticsByWebsiteIdAndDate(websiteId: number, date: string) {
//   const response = await fetch(
//     `${adServerUrl}/get-website-statistics-by-website-id-and-date?websiteId=${encodeURIComponent(
//       websiteId
//     )}&date=${encodeURIComponent(date)}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     }
//   );

//   // Processando o corpo da resposta como JSON
//   if (response.ok) {
//     const data = await response.json();
//     // console.log('RESPONSE DATA:', data);
//     return data; // Retornando os dados
//   } else {
//     console.error('Error fetching data:', response.statusText);
//     throw new Error(response.statusText); // Lançando um erro se a resposta não for ok
//   }
// }

// export async function updateWebsiteStatistics(websiteStatistics: WebsiteStatistics) {
//   const response = await fetch(
//     adServerUrl + "/update-website-statistics",
//     {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(websiteStatistics),
//     }
//   );

//   if (!response.ok) {
//     console.error('Error updating data:', response.statusText); // Mensagem de erro se a resposta não for ok
//     throw new Error(response.statusText); // Lança o erro
//   } else {
//     // console.log("Website statistics updated successfully");
//   }
// }

// export async function saveWebsiteStatistics(websiteStatistics: WebsiteStatistics) {
//   const response = await fetch(
//     adServerUrl + "/save-website-statistics",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(websiteStatistics),
//     }
//   );
//   if (!response.ok) {
//     console.error("Failed to save website statistics");
//   }
// }
