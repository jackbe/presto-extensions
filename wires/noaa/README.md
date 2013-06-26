presto-extensions/wires/noaa
=================

This collection of services and custom blocks illustrates how a user can tool a WSDL to be used in Presto's Wires tool.
There are two wires blocks and one WSDL used in the example.

Installation
=================

1. In the Presto admin console under Platform Features > File Resources upload the two .png files for the custom blocks.
2. Use the padmin tool to import the noaa.emml-macros file and the noaa.service file.
3. To import the noaa.service file use the padmin importServices command (http://mdc.jackbe.com/prestodocs/v3.6/administration/importServices.html)
4. To import the noaa.emml-macros file use the padmin importEmmlMacro command (http://mdc.jackbe.com/prestodocs/v3.6/administration/importMacros.html)


Usage
=================

1. Open the Presto Wires tool
2. Drag both of the Weather block on to the canvas.
3. Drag an Extract block on to the canvas.
4. Run the NOAA Query by Rectangle block.
5. Connect this block to the Extract Block and extra the latlonList string.
6. Connect the extract block to the NOAA Digital Weather Forecast block.
7. Connect the NOAA Digital Weather Forecast block to Mashup Output block and save your mashup.
7. Run the mashup and view the Weather Forecast.

Tested On
=================
Presto 3.6