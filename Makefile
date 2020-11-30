build:
	docker build -t petio .
	cd api && docker build -t petio-api .

run:
	cd api && npm install && npm start
	

docker:
	docker build -t petio .
	cd api && docker build -t petio-api .
	docker-compose up -d

docker stop:
	docker-compose down