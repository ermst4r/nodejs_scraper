var excelbuilder = require('msexcel-builder');
var fs = require('fs');
var json2csv = require('json2csv');
var exportAuteur = 'Arthur Goldman';
var Export = function () {

    this.exportCsv = function (websiteName,jsonFile,res) {
        json2csv({data: jsonFile, fields: ['productName','shopName','type','zichtbaarheid','uitgeklapt','startDate',
                'endDate','clickouts','','auteur','couponCode','extra_field','exclusief','editor_picks',
                'user_generated','goedgekeurd','offline','created_at','deeplink','extra_field2','media_id']}, function(err, csv) {
            res.setHeader('Content-disposition', 'attachment; filename=' + websiteName + '.csv');
            res.setHeader("Content-Type", "application/csv; charset=utf-8");
            res.send(csv);
        });

    },



    this.exportXls = function (websiteName,jsonFile,res) {
        // Create a new workbook file in current working-path
        var workbook = excelbuilder.createWorkbook('./', websiteName+'.xlsx');
        var sheet1 = workbook.createSheet(websiteName, 21, jsonFile.length +2);
        sheet1.set(1, 1, 'form_backend_Offer Title | Text | Required');
        sheet1.set(2, 1, 'form_backend_Shop Name | Text | Required');
        sheet1.set(3, 1, 'OfferType | sale/coupon | Optional | Defaults to sale');
        sheet1.set(4, 1, 'Visibility | DE/MEM | Optional | Defaults to DE');
        sheet1.set(5, 1, 'Extended | 0 (Off) | Optional | Defaults to 0');
        sheet1.set(6, 1, 'form_backend_Start Date | DD-MM-YYYY (01-01-1970) | Required');
        sheet1.set(7, 1, 'form_backend_End Date | DD-MM-YYYY (01-01-1970) | Required | Must be in future');
        sheet1.set(8, 1, 'Clickouts | Number | Optional | Defaults to 0');
        sheet1.set(9, 1, 'Author Name | Text | Optional | Defaults to Arthur Goldman');
        sheet1.set(10, 1, 'Coupon Code | Text | Alphanumeric |Optional | Defaults to NULL');
        sheet1.set(11, 1, 'Exclusive | 0/1 (Off/On) | Required');
        sheet1.set(12, 1, 'Editor Pick | 0/1 (Off/On) | Required');
        sheet1.set(13, 1, 'UserGenerated | 0/1 (Off/On) | Optional | Defaults to 0');
        sheet1.set(14, 1, 'Offline | 0/1 (Off/On) | Optional | Defaults to 0');
        sheet1.set(15, 1, 'Created_at | DD-MM-YYYY (01-01-1970) | Optional | Defaults to CURRENT_DATE');
        sheet1.set(16, 1, 'Deeplink | Url (http://www.flipit.com) | Optional | Defaults to NULL');
        sheet1.set(17, 1, 'Tiles id | Number | Optional | Defaults to NULL');
        var row = 2;
        for (var x=0; x<jsonFile.length; x++) {
            var obj = jsonFile[x];
            sheet1.set(1, row, obj.productName);
            sheet1.set(2, row, obj.shopName);
            sheet1.set(3, row, obj.type);
            sheet1.set(4, row, obj.zichtbaarheid);
            sheet1.set(5, row, obj.uitgeklapt);
            sheet1.set(6, row, obj.startDate);
            sheet1.set(7, row, obj.endDate);
            sheet1.set(8, row, obj.clickouts);
            sheet1.set(9, row, obj.auteur);
            sheet1.set(10, row, obj.couponCode);
            sheet1.set(11, row, obj.exclusief);
            sheet1.set(12, row, obj.editor_picks);
            sheet1.set(13, row, obj.user_generated);
            sheet1.set(14, row, obj.offline);
            sheet1.set(15, row, obj.created_at);
            sheet1.set(16, row, obj.deeplink);
            sheet1.set(17, row, obj.media_id);
            row++;
        }
        workbook.save(function(err){
            if(!err) {
                res.download('./'+String(websiteName)+'.xlsx', function(err){
                    if (err) {
                        res.send("download error");
                    } else {
                        fs.unlink('./'+String(websiteName)+'.xlsx', function (err) {
                            if (err) throw err;
                            console.log('successfully deleted '+'./'+String(websiteName)+'.xlsx');
                        });
                    }
                });
            }
        });
    };
};

module.exports = function () {
    var instance = new Export();
    return instance;
};