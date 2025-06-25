package com.Backend.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}


	//Karan---

	//Vereinfachtes Mapping zum ziehen des App-Namens im Fronted von dem Backend
	@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:52564"})
	@GetMapping("/AppName")
	public String appName() {
		return "TrackFit";
	}

	//"Server is running" String X Whitelabel Error Page
	@GetMapping
	public String ServerIsRunning(){
		return "The Server is running :-) ... please start the Frontend in an integrated Terminal via ng serve --open";
	}

	//Karan---


}
