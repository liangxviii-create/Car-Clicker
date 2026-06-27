import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (n < 0) return "-" + formatNumber(-n);
  if (n >= 1e99)  return (n / 1e99).toPrecision(3)  + " Googol";
  if (n >= 1e96)  return (n / 1e96).toFixed(2)  + "Duotrig";
  if (n >= 1e93)  return (n / 1e93).toFixed(2)  + "Untrig";
  if (n >= 1e90)  return (n / 1e90).toFixed(2)  + "Trig";
  if (n >= 1e87)  return (n / 1e87).toFixed(2)  + "NovVig";
  if (n >= 1e84)  return (n / 1e84).toFixed(2)  + "OctVig";
  if (n >= 1e81)  return (n / 1e81).toFixed(2)  + "SepVig";
  if (n >= 1e78)  return (n / 1e78).toFixed(2)  + "SexVig";
  if (n >= 1e75)  return (n / 1e75).toFixed(2)  + "QuinVig";
  if (n >= 1e72)  return (n / 1e72).toFixed(2)  + "QuadVig";
  if (n >= 1e69)  return (n / 1e69).toFixed(2)  + "TerVig";
  if (n >= 1e66)  return (n / 1e66).toFixed(2)  + "DuoVig";
  if (n >= 1e63)  return (n / 1e63).toFixed(2)  + "UnVig";
  if (n >= 1e60)  return (n / 1e60).toFixed(2)  + "Vig";
  if (n >= 1e57)  return (n / 1e57).toFixed(2)  + "NovDec";
  if (n >= 1e54)  return (n / 1e54).toFixed(2)  + "OctDec";
  if (n >= 1e51)  return (n / 1e51).toFixed(2)  + "SepDec";
  if (n >= 1e48)  return (n / 1e48).toFixed(2)  + "SexDec";
  if (n >= 1e45)  return (n / 1e45).toFixed(2)  + "QuinDec";
  if (n >= 1e42)  return (n / 1e42).toFixed(2)  + "QuadDec";
  if (n >= 1e39)  return (n / 1e39).toFixed(2)  + "TerDec";
  if (n >= 1e36)  return (n / 1e36).toFixed(2)  + "DuoDec";
  if (n >= 1e33)  return (n / 1e33).toFixed(2)  + "UnDec";
  if (n >= 1e30)  return (n / 1e30).toFixed(2)  + "Non";
  if (n >= 1e27)  return (n / 1e27).toFixed(2)  + "Oct";
  if (n >= 1e24)  return (n / 1e24).toFixed(2)  + "Sp";
  if (n >= 1e21)  return (n / 1e21).toFixed(2)  + "Sx";
  if (n >= 1e18)  return (n / 1e18).toFixed(2)  + "Qt";
  if (n >= 1e15)  return (n / 1e15).toFixed(2)  + "Q";
  if (n >= 1e12)  return (n / 1e12).toFixed(2)  + "T";
  if (n >= 1e9)   return (n / 1e9).toFixed(2)   + "B";
  if (n >= 1e6)   return (n / 1e6).toFixed(2)   + "M";
  if (n >= 1e3)   return (n / 1e3).toFixed(1)   + "K";
  return Math.floor(n).toString();
}
