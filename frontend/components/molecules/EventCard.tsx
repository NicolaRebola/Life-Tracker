import { Button } from "../tailgrids/core/button";
import { Card, CardContent, CardFooter, CardHeader } from "../tailgrids/core/card";
import {Trash1} from "@tailgrids/icons"

export default function EventCard() {
  return (
    <Card className="w-full md:min-w-0 md:w-full border border-gray-200 rounded-md bg-card-background-200">
      <CardHeader className="text-md font-bold text-card-600">Some Event</CardHeader>
      <CardContent className="text-xs text-card-400">Some Description</CardContent>
      <CardFooter>
        <div className="flex flex-row gap-2 w-full">
          <Button className="float-right" appearance="outline" variant="danger" size="xs">
            <Trash1 />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}	