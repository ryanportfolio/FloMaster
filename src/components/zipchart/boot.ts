// Starts every hull chart on the page. Loaded by ZipChart.astro after the page has loaded.
import { initChart } from "./chart";
document.querySelectorAll<HTMLElement>("[data-zipchart]").forEach(initChart);
