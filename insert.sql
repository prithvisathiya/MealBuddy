-- insert into items (id,name,calories,fat,sugar,potassium,type,phosphorous,calcium,servingsize,cuisine, imagePath)
-- 	values
-- 	(1,'brocolli', 32,5,3,NULL,'vegetable',NULL,NULL,NULL,NULL,'default_item_image.jpg'),
-- 	(2,'pizza',340,25,15,NULL,'meal',NULL,NULL,NULL,NULL,'milk.jpg'),
-- 	(3,'banana',34,2,5,NULL,'fruit',NULL,NULL,NULL,NULL,'milk.jpg'),
-- 	(4,'red curry',1200,25,13,2,'meal',0,0,'12 oz','Thai','milk.jpg');

Select name, coalesce(servingsize,null) as servingsize, coalesce(calories, null) as calories, coalesce(fat, null) as fat, coalesce(sugar, null) as sugar, coalesce(potassium, null) as potassium, coalesce(calcium, null) as calcium, coalesce(phosphorous, null) as phosphorous, coalesce(type, null) as type, coalesce(cuisine, null) as cuisine, imagePath from items where 1=1 and fat between 0 and 30

