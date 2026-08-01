import React from "react";
import SeoHead from "../../Seohead";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SeoHead
        title="Terms and Conditions"
        description="Read Cloud Company's terms and conditions for using our website and services."
        canonical="/termsandcondition"
      />
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Terms and Conditions
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                1. Introduction
              </h2>
              <p>
                Welcome to Cloud Company. These Terms and Conditions explain the
                rules and responsibilities that apply when you access our
                website, browse our services, purchase packages, submit project
                requirements, apply for jobs, contact us, or use any digital
                service provided by us.
              </p>
              <p className="mt-3">
                By using this website or our services, you agree to follow these
                terms. If you do not agree with any part of these Terms and
                Conditions, you should stop using our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                2. About Our Services
              </h2>
              <p>
                Cloud Company provides digital and technology-based services,
                including but not limited to website development, mobile app
                development, software development, graphic design, UI/UX design,
                social media design, digital marketing, branding, content
                writing, business solutions, and related professional services.
              </p>
              <p className="mt-3">
                The details, features, price, delivery time, and requirements of
                each service may vary depending on the selected package, custom
                quotation, client needs, and project complexity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                3. Eligibility to Use Our Website
              </h2>
              <p>
                By using our website, you confirm that you are capable of
                entering into a service agreement. If you are using our services
                on behalf of a company, organization, or business, you confirm
                that you have permission to represent that entity.
              </p>
              <p className="mt-3">
                Users must not use our website or services for any illegal,
                harmful, abusive, misleading, or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                4. User Account and Information
              </h2>
              <p>
                Some services may require users to create an account or provide
                personal information such as name, email address, phone number,
                company name, project details, or payment information. You agree
                to provide accurate, complete, and updated information.
              </p>
              <p className="mt-3">
                You are responsible for keeping your login details secure. Cloud
                Company will not be responsible for loss or damage caused by
                unauthorized access due to weak passwords, shared login details,
                or user negligence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                5. Orders and Project Confirmation
              </h2>
              <p>
                An order is considered confirmed when the client submits the
                required project information and completes the agreed payment or
                advance payment. For custom projects, confirmation may also
                require written approval of the quotation, timeline, and project
                scope.
              </p>
              <p className="mt-3">
                We reserve the right to reject or cancel any order if the
                provided information is incomplete, misleading, illegal, harmful,
                or outside the scope of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                6. Project Requirements
              </h2>
              <p>
                Clients must provide all necessary information, content, images,
                documents, brand guidelines, access credentials, hosting details,
                references, and instructions required to complete the project.
              </p>
              <p className="mt-3">
                Delays in providing required materials may extend the delivery
                timeline. Cloud Company will not be responsible for project
                delays caused by late responses, incomplete instructions, or
                missing materials from the client.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                7. Pricing and Payment
              </h2>
              <p>
                Service prices may be displayed on the website or provided
                through a custom quotation. Prices may vary based on project
                type, features, urgency, revisions, integrations, third-party
                tools, and additional client requirements.
              </p>
              <p className="mt-3">
                Payment may be required in full or in parts depending on the
                service agreement. Work may not begin until the required advance
                payment is received. Final files, source code, credentials, or
                completed deliverables may be withheld until full payment is
                completed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                8. Delivery Timeline
              </h2>
              <p>
                Delivery timelines shown on packages or quotations are estimated
                timelines. Actual delivery may depend on project complexity,
                communication speed, client feedback, revision requests, public
                holidays, technical issues, and third-party service delays.
              </p>
              <p className="mt-3">
                We always try to deliver work on time, but we do not guarantee a
                fixed delivery date unless it is clearly agreed in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                9. Revisions and Changes
              </h2>
              <p>
                Revisions are provided based on the selected package or custom
                agreement. A revision means a reasonable modification to the
                already agreed work. It does not include a completely new
                design, new feature, new content direction, or change in the
                original project scope.
              </p>
              <p className="mt-3">
                Additional revisions, extra pages, new features, major design
                changes, urgent delivery, or new requirements may require extra
                charges and additional delivery time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                10. Client Approval
              </h2>
              <p>
                Clients are responsible for reviewing the work carefully before
                final approval. Once a project, design, content, or digital
                product is approved, further changes may be treated as new work
                and may require additional charges.
              </p>
              <p className="mt-3">
                If a client does not respond within a reasonable time, we may
                pause the project or mark the submitted work as approved based
                on the last available instruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                11. Refund Policy
              </h2>
              <p>
                Refund requests are reviewed based on the project status, work
                completed, resources used, and agreement between both parties.
                Once work has started, a full refund may not be available.
              </p>
              <p className="mt-3">
                No refund may be provided for completed work, approved designs,
                delivered digital products, urgent services, third-party costs,
                domain/hosting purchases, paid tools, or services already
                delivered to the client.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                12. Cancellation Policy
              </h2>
              <p>
                Clients may request cancellation before work begins. If the
                project has already started, any cancellation request will be
                reviewed based on completed work and expenses already incurred.
              </p>
              <p className="mt-3">
                Cloud Company may cancel a project if the client provides false
                information, fails to communicate, delays payment, requests
                illegal work, behaves abusively, or violates these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                13. Intellectual Property Rights
              </h2>
              <p>
                After full payment, final approved deliverables may be
                transferred to the client according to the service agreement.
                Until full payment is completed, all project files, designs,
                source code, drafts, and concepts remain the property of Cloud
                Company.
              </p>
              <p className="mt-3">
                We may use completed work, screenshots, designs, or project
                summaries in our portfolio, website, social media, or marketing
                materials unless the client requests confidentiality before the
                project begins.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                14. Third-Party Tools and Services
              </h2>
              <p>
                Some projects may require third-party services such as domain
                providers, hosting platforms, payment gateways, APIs, plugins,
                themes, fonts, stock images, analytics tools, or external
                software. These third-party services are controlled by their own
                providers.
              </p>
              <p className="mt-3">
                Cloud Company is not responsible for downtime, price changes,
                policy changes, account suspension, data loss, or technical
                issues caused by third-party platforms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                15. Content Provided by Clients
              </h2>
              <p>
                Clients are responsible for the legality and accuracy of any
                text, images, videos, logos, documents, trademarks, or materials
                provided to us. You confirm that you have the right to use all
                materials submitted for your project.
              </p>
              <p className="mt-3">
                We are not responsible for copyright claims, trademark disputes,
                or legal issues caused by content supplied by the client.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                16. Prohibited Use
              </h2>
              <p>
                You must not use our website or services to upload malware,
                spam, harmful files, illegal content, stolen materials,
                misleading information, abusive content, or anything that may
                damage our website, users, employees, business, or reputation.
              </p>
              <p className="mt-3">
                We reserve the right to block access, remove content, reject
                work, cancel accounts, or take necessary action against users
                who violate these rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                17. Job Applications
              </h2>
              <p>
                Users may apply for jobs through our website by submitting
                their personal details and CV. Submission of an application does
                not guarantee employment, interview selection, or hiring.
              </p>
              <p className="mt-3">
                We reserve the right to review, reject, store, or delete job
                applications according to our recruitment needs and internal
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                18. Limitation of Liability
              </h2>
              <p>
                Cloud Company will not be liable for indirect losses, business
                interruption, loss of revenue, data loss, third-party failure,
                hosting issues, security breaches caused by client negligence,
                or damages resulting from misuse of delivered work.
              </p>
              <p className="mt-3">
                Our total responsibility for any claim related to a service will
                not exceed the amount paid by the client for that specific
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                19. Changes to These Terms
              </h2>
              <p>
                We may update these Terms and Conditions from time to time.
                Updated terms will be posted on this page with the latest
                update date. Continued use of our website or services after any
                update means you accept the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                20. Contact Us
              </h2>
              <p>
                For questions about these Terms and Conditions, service
                agreements, orders, payments, or project policies, please
                contact us through our official website contact form, email,
                phone number, or social media channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;