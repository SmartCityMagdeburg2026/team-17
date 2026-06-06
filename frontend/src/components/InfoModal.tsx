import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type InfoModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InfoModal = ({ isOpen, onOpenChange }: InfoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About 15 Minutes City - Magdeburg</DialogTitle>
          <DialogDescription>
            General information and data sources.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <section className="space-y-2">
            <h4 className="text-sm font-medium leading-none">Application</h4>
            <p className="text-sm text-gray-400">
              This application helps you explore the accessibility of various services and points of interest (POIs) in Magdeburg. 
              You can switch between "15 Minutes City" mode (using isochrones based on transport modes) and "Districts" mode.
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-sm font-medium leading-none">Data Sources</h4>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>
                <span className="font-medium text-gray-300">OpenStreetMap:</span> POI data and map tiles.
              </li>
              <li>
                <span className="font-medium text-gray-300">OpenRouteService:</span> Isochrone generation and routing.
              </li>
              <li>
                <span className="font-medium text-gray-300">City of Magdeburg:</span> District boundaries and local statistical data.
              </li>
              <li>
                <span className="font-medium text-gray-300">Geofabrik:</span> Preprocessed geospatial data for Magdeburg.
              </li>
              <li>
                <span className="font-medium text-gray-300">NASA GmbH & MVG GmbH & Co. KG:</span> Public transport data.
              </li>
              <li>
                <span className="font-medium text-gray-300">Generaldirektion Wasserstraßen und Schifffahrt:</span> Water quality data
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
