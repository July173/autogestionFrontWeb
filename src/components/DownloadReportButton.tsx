import React from "react";
import { BsSave } from "react-icons/bs";

/**
 * Props interface for the DownloadReportButton component.
 * Defines the customizable properties for the download report button.
 */
interface DownloadReportButtonProps {
  /** Optional text to display on the button. Defaults to "Descargar informe" */
  text?: string;
  /** Optional click handler function called when the button is clicked */
  onClick?: () => void;
}

/**
 * DownloadReportButton component - A styled button for downloading reports.
 *
 * This component renders a green button with a save icon and customizable text.
 * It's designed for report download functionality with consistent styling.
 *
 * @example
 * ```tsx
 * <DownloadReportButton
 *   text="Download PDF Report"
 *   onClick={() => console.log('Downloading report...')}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A styled button element for report downloads
 */
const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  text = "Descargar informe",
  onClick,
}) => (
  <button
    className="w-[240px] h-[38px] bg-green-800 opacity-80 rounded-[7px] flex items-center relative px-4"
    onClick={onClick}
    type="button"
  >
    {/* Save icon positioned on the left side of the button */}
    <span className="absolute left-[10px] top-[8px] w-[28px] h-[22px] flex items-center justify-center ">
      <BsSave className="text-white" size={18} />
    </span>
    {/* Button text positioned to the right of the icon */}
    <span className="ml-[48px] text-white text-[18px] font-medium font-['Roboto'] leading-[32px]">
      {text}
    </span>
  </button>
);

export default DownloadReportButton;
