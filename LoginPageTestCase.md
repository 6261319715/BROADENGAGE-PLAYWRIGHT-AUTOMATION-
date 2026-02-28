Test ID	Test Scenario	Test Steps 	Test Data	Expected Result 		
SU_01	Valid Signup	Fill all fields + complete CAPTCHA → Sign Up	Valid data (name 3–20, org 3–20, email, phone 10 digits, password 8+ with number/letter/special, terms checked)	Redirect to OTP page (/auth/registerOtp)		
SU_02	Existing Email	Enter already registered email + complete CAPTCHA → Sign Up	user@test.com	Error snackbar: Email already exists / Registration failed		
SU_03	Mandatory Fields Empty	Click Sign Up without entering data	-	Validation: Name, Organisation name, Email, Phone, Password, Terms required		
SU_UI_01	Register page loads	Open /auth/register	-	All fields (Full Name, Organisation Name, Email ID, Phone, Password), checkbox, Sign Up, Login link visible		
SU_UI_02	Login link	Click "Login" on register page	-	Navigate to /auth/login		
SU_UI_03	Password visibility	Toggle eye icon on password field	Any password	Password toggles between masked and visible		
SU_FN_01	Full Name empty	Leave Full Name blank, fill rest, submit	-	"Name is required"		
SU_FN_02	Full Name invalid chars	Enter numbers/special in Full Name	John123	"Please enter a valid name" (letters/spaces only)		
SU_FN_03	Full Name too short	Enter &lt; 3 chars	Jo	"Name must be at least 3 characters"		
SU_FN_04	Full Name too long	Enter &gt; 20 chars	21+ characters	"Name must be at most 20 characters"		
SU_ORG_01	Organisation name empty	Leave Organisation blank, fill rest, submit	-	"Organisation name is required"		
SU_ORG_02	Organisation too short	Enter &lt; 3 chars	Ab	"Name must be at least 3 characters"		
SU_ORG_03	Organisation too long	Enter &gt; 20 chars	21+ characters	"Name must be at most 20 characters"		
SU_EM_01	Email empty	Leave Email blank, fill rest, submit	-	"Email is required"		
SU_EM_02	Invalid email format	Enter invalid email	invalid-email	"Please enter a valid email"		
SU_PH_01	Phone empty	Leave Phone blank, fill rest, submit	-	"Phone number is required"		
SU_PH_02	Phone non-digits	Enter letters in Phone	98765abcde	"Phone number must contain only digits"		
SU_PH_03	Phone not 10 digits	Enter 5 or 11 digits	12345	"Number must be exactly 10 digits"		
SU_PW_01	Password empty	Leave Password blank, fill rest, submit	-	"Password is required"		
SU_PW_02	Password weak	No number/letter/special or &lt; 8 chars	simple	"Password must contain at least one number, one letter, one special character, and be at least 8 characters long"		
SU_TC_01	Terms unchecked	Leave terms unchecked, fill rest, submit	-	"You must accept the terms and conditions"		
SU_CAP_01	CAPTCHA not completed	Fill all valid fields, do not complete CAPTCHA, submit	Valid data	"Please complete the captcha to continue."		
Login Test Cases						
LI_01	Valid Login	Enter valid email & password 	valid@123/ Pass@123	User logged in successfully and redirected to dashboard		
LI_02	Invalid Password	Enter valid email & wrong password 	valid@123/ wrong123	Error message: Invalid credentials		
LI_03	Unregistered Email	Enter unregistered email 	new@123/ Pass@123	Error message: User not found		
LI_04	Mandatory Fields Empty	Click Login without entering data	-	Error message: All fields are required		
LI_05	Email Field Empty	Leave email blank 	blank / Pass@123	Validation message: Email is required		
LI_06	Password Field Empty	Leave password blank	valid@123/ blank	Validation message: Password is required		
LI_07	Invalid Email Format	Enter wrong email format 	wrong mail / Pass@123	Error message: Enter valid email address		
LI_08	Password Case Sensitivity	Enter correct email but different case password	user@test.com / pass@123	Error message: Invalid credentials		
LI_09	Multiple Failed Attempts	Enter wrong password 5 times	user@test.com / wrong123	Account temporarily locked (if applicable)		
LI_10	Session After Logout	Login → Logout → Click Back button	Valid credentials	Should not access dashboard		
						