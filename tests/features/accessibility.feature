@ally @rra-bulk-publish
Feature: Accessibility Validation - RRA Bulk Publish Pages
  As a Senior QA Engineer
  I want to validate all RRA pages meet WCAG 2.1 AA standards
  So that users with disabilities can access renters rights content after the 1st May 2026 go-live

  @a11y-desktop
  Scenario Outline: Page "<URL>" passes WCAG 2.1 AA at desktop viewport
    Given I am using the "desktop" viewport
    And I navigate to "<URL>"
    When I run an accessibility scan
    Then the page should pass WCAG 2.1 AA

    Examples:
      | URL                                                                                                                                         |
      | /housing_advice/eviction/what_to_say_if_your_landlord_turns_up_without_permission                                                          |
      | /housing_advice/eviction/harassment_by_a_private_landlord/understand_your_tenancy_rights                                                   |
      | /housing_advice/eviction/harassment_by_a_private_landlord/keep_a_record_of_harassment                                                      |
      | /housing_advice/eviction/eviction_after_a_section_8_notice                                                                                 |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/possession_grounds                                                              |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/court_action                                                                    |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/get_ready_for_court                                                             |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/court_hearing                                                                   |
      | /housing_advice/repossession/when_your_tenancy_is_binding_on_the_landlords_mortgage_lender                                                 |
      | /housing_advice/tenancy_deposits/tenancy_deposit_protection_rules                                                                          |
      | /housing_advice/tenancy_deposits/what_to_do_about_an_unprotected_tenancy_deposit                                                           |
      | /housing_advice/tenancy_deposits/change_of_landlord_or_agent_what_happens_to_the_deposit                                                   |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement                                                                 |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/landlord_tenant_and_property                                    |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/rent_bills_and_council_tax                                      |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/deposits_charges_and_fees                                       |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/fixed_terms_and_break_clauses                                   |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/tenant_responsibilities                                         |
      | /housing_advice/private_renting/how_to_end_a_tenancy_before_you_move_in                                                                    |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination                                                                        |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination/viewing_request_letter_template                                        |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination/formal_complaint_letter_template                                       |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children                                                 |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children/looking_for_family_home_letter_template         |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children/formal_complaint_letter_template                |
      | /housing_advice/downloads_and_tools/tenancy_checker                                                                                        |
      | /housing_advice/private_renting/occupiers_with_basic_protection                                                                            |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early                                                                      |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/speak_to_other_joint_tenants                                         |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/use_a_break_clause                                                   |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/negotiate_with_your_landlord                                         |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/right_to_unwind                                                      |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/options_if_you_cant_get_out_of_your_contract                         |
      | /housing_advice/private_renting/private_rented_housing_for_students                                                                        |
      | /housing_advice/private_renting/renting_as_a_property_guardian                                                                             |
      | /housing_advice/private_renting/tenancy_agreements_in_shared_homes                                                                         |
      | /housing_advice/private_renting/tenancy_rights_if_your_landlord_sells_your_home                                                            |
      | /housing_advice/private_renting/what_happens_if_you_dont_end_your_tenancy_legally                                                          |

  @a11y-mobile
  Scenario Outline: Page "<URL>" passes WCAG 2.1 AA at mobile viewport
    Given I am using the "mobile" viewport
    And I navigate to "<URL>"
    When I run an accessibility scan
    Then the page should pass WCAG 2.1 AA

    Examples:
      | URL                                                                                                                                         |
      | /housing_advice/eviction/what_to_say_if_your_landlord_turns_up_without_permission                                                          |
      | /housing_advice/eviction/harassment_by_a_private_landlord/understand_your_tenancy_rights                                                   |
      | /housing_advice/eviction/harassment_by_a_private_landlord/keep_a_record_of_harassment                                                      |
      | /housing_advice/eviction/eviction_after_a_section_8_notice                                                                                 |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/possession_grounds                                                              |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/court_action                                                                    |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/get_ready_for_court                                                             |
      | /housing_advice/eviction/eviction_after_a_section_8_notice/court_hearing                                                                   |
      | /housing_advice/repossession/when_your_tenancy_is_binding_on_the_landlords_mortgage_lender                                                 |
      | /housing_advice/tenancy_deposits/tenancy_deposit_protection_rules                                                                          |
      | /housing_advice/tenancy_deposits/what_to_do_about_an_unprotected_tenancy_deposit                                                           |
      | /housing_advice/tenancy_deposits/change_of_landlord_or_agent_what_happens_to_the_deposit                                                   |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement                                                                 |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/landlord_tenant_and_property                                    |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/rent_bills_and_council_tax                                      |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/deposits_charges_and_fees                                       |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/fixed_terms_and_break_clauses                                   |
      | /housing_advice/private_renting/what_to_look_for_in_your_tenancy_agreement/tenant_responsibilities                                         |
      | /housing_advice/private_renting/how_to_end_a_tenancy_before_you_move_in                                                                    |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination                                                                        |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination/viewing_request_letter_template                                        |
      | /housing_advice/private_renting/how_to_challenge_dss_discrimination/formal_complaint_letter_template                                       |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children                                                 |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children/looking_for_family_home_letter_template         |
      | /housing_advice/private_renting/how_to_challenge_discrimination_when_renting_with_children/formal_complaint_letter_template                |
      | /housing_advice/downloads_and_tools/tenancy_checker                                                                                        |
      | /housing_advice/private_renting/occupiers_with_basic_protection                                                                            |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early                                                                      |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/speak_to_other_joint_tenants                                         |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/use_a_break_clause                                                   |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/negotiate_with_your_landlord                                         |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/right_to_unwind                                                      |
      | /housing_advice/private_renting/how_to_end_a_fixed_term_tenancy_early/options_if_you_cant_get_out_of_your_contract                         |
      | /housing_advice/private_renting/private_rented_housing_for_students                                                                        |
      | /housing_advice/private_renting/renting_as_a_property_guardian                                                                             |
      | /housing_advice/private_renting/tenancy_agreements_in_shared_homes                                                                         |
      | /housing_advice/private_renting/tenancy_rights_if_your_landlord_sells_your_home                                                            |
      | /housing_advice/private_renting/what_happens_if_you_dont_end_your_tenancy_legally                                                          |
