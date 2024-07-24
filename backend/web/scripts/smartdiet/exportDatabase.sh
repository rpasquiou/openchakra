echo "Exporting smartdiet database started at `date`"
source /home/ec2-user/.bashrc
cd /home/ec2-user
rm -rf ./export
mkdir export
/usr/bin/python3 -m alfred.db_export.full_export smartdiet export 
current_date_time=$(date +"%y%m%d-%H%M%S")
filename="smartdiet-${current_date_time}.zip"
zip -r /tmp/$filename export
# Loop until scp succeeds
while true; do
  scp -i ~/.ssh/ALFRED-AWS.pem /tmp/${filename} wappizy@34.155.152.95:/home/wappizy
  if [ $? -eq 0 ]; then
    echo "SCP succeeded"
    break
  else
    echo "SCP failed, retrying in 5 seconds..."
    sleep 5
  fi
done
rm /tmp/${filename}
echo "Exporting smartdiet database finished at `date`"
